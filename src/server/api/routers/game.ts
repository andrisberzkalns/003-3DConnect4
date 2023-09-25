import { z } from "zod";
import { Turn, GameState, GameType, Game, Move } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import * as THREE from "three";
import { checkIsWin } from "~/utils/checkIsWin";
import { ESquareState } from "~/utils/gameTypes";

type GameListItem = {
  id: string;
  host: { id: string; name?: string | null; image?: string | null };
  color: Turn;
  type: GameType;
  createdAt: Date;
};

// Create a new ratelimiter, that allows 1 requests per 1 minute
const createRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(4, "1 m"),
  analytics: true,
});
const getWaitingRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "4 s"),
  analytics: true,
});
const moveRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "2 s"),
  analytics: true,
});

// enum GameSquare {
//   EMPTY,
//   LIGHT,
//   DARK,
// }

export const gameRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        color: z.enum([Turn.DARK, Turn.LIGHT]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await createRatelimit.limit(ctx.session.user.id);
      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Slow down!",
        });

      // Check if user is already in another game
      const userGames = await ctx.db.game.findMany({
        where: {
          AND: [
            {
              OR: [
                { state: GameState.PLAYING },
                { state: GameState.WAITINGFORPLAYERS },
              ],
            },
            {
              OR: [
                { whiteUserId: ctx.session.user.id },
                { blackUserId: ctx.session.user.id },
              ],
            },
          ],
        },
      });
      if (userGames.length > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have an active game",
        });

      const whiteTurn = input.color === Turn.LIGHT ? ctx.session.user.id : null;
      const blackTurn = input.color === Turn.DARK ? ctx.session.user.id : null;

      const game = await ctx.db.game.create({
        data: {
          state: GameState.WAITINGFORPLAYERS,
          turn: Turn.LIGHT,
          type: GameType.PVPREMOTE,
          whiteUserId: whiteTurn,
          blackUserId: blackTurn,
          hostUserId: ctx.session.user.id,
        },
      });
      return game.id;
    }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({ where: { id: input.id } });
      if (!game) throw new TRPCError({ code: "NOT_FOUND" });
      return game;
    }),

  abandon: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({ where: { id: input.id } });
      if (!game) throw new TRPCError({ code: "NOT_FOUND" });

      // Check if game is waiting for players
      if (game.state !== GameState.PLAYING)
        throw new TRPCError({ code: "BAD_REQUEST" });

      // Check if user is already in game
      if (
        game.whiteUserId !== ctx.session.user.id &&
        game.blackUserId !== ctx.session.user.id
      )
        throw new TRPCError({ code: "BAD_REQUEST" });

      // Winning state
      const winnerState =
        game.whiteUserId === ctx.session.user.id
          ? GameState.DARKWIN
          : GameState.LIGHTWIN;

      // Update game
      const data = {
        state: winnerState,
      };
      const updatedGame = await ctx.db.game.update({
        where: { id: input.id },
        data,
      });

      return updatedGame;
    }),

  getWaiting: publicProcedure.query(async ({ ctx }) => {
    // const { success } = await getWaitingRatelimit.limit(ctx.session.user.id);
    // if (!success)
    //   throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Slow down!" });

    const games = await ctx.db.game.findMany({
      where: { state: GameState.WAITINGFORPLAYERS },
    });

    const gameList: GameListItem[] = [];

    for (const game of games) {
      const user = await ctx.db.user.findUnique({
        where: { id: game.hostUserId },
      });
      gameList.push({
        id: game.id,
        host: {
          id: game.hostUserId,
          name: user?.name,
          image: user?.image,
        },
        color: game.whiteUserId ? Turn.LIGHT : Turn.DARK,
        type: game.type,
        createdAt: game.createdAt,
      });
    }

    return gameList.reverse();
  }),

  getMoves: protectedProcedure
    .input(z.object({ gameId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const moves = await ctx.db.move.findMany({
        where: { gameId: input.gameId },
        orderBy: { createdAt: "asc" },
      });
      return moves;
    }),

  myActiveGame: protectedProcedure.query(async ({ ctx }) => {
    const game = await ctx.db.game.findFirst({
      where: {
        AND: [
          {
            OR: [
              { state: GameState.PLAYING },
              { state: GameState.WAITINGFORPLAYERS },
            ],
          },
          {
            OR: [
              { whiteUserId: ctx.session.user.id },
              { blackUserId: ctx.session.user.id },
            ],
          },
        ],
      },
    });
    if (!game) throw new TRPCError({ code: "NOT_FOUND" });
    return game;
  }),

  move: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({ where: { id: input.id } });
      if (!game) throw new TRPCError({ code: "NOT_FOUND" });

      const { success } = await moveRatelimit.limit(ctx.session.user.id);
      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Slow down!",
        });

      // Check if move is for correct user
      if (game.turn == Turn.LIGHT && game.whiteUserId !== ctx.session.user.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "It is not your move!",
        });
      if (game.turn == Turn.DARK && game.blackUserId !== ctx.session.user.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "It is not your move!",
        });

      // Get next move height
      const moves = await ctx.db.move.findMany({
        where: { gameId: input.id, positionX: input.x, positionY: input.y },
        orderBy: { createdAt: "desc" },
      });
      let nextMoveHeight = 0;
      if (moves[0])
        nextMoveHeight = moves.length > 0 ? moves[0].positionZ + 1 : 0;

      const moveData = {
        turn: game.turn === Turn.LIGHT ? Turn.LIGHT : Turn.DARK,
        positionX: input.x,
        positionY: input.y,
        positionZ: nextMoveHeight,
        gameId: game.id,
      };
      const move = await ctx.db.move.create({ data: moveData });

      await ctx.db.game.update({
        where: { id: input.id },
        data: { turn: game.turn === Turn.LIGHT ? Turn.DARK : Turn.LIGHT },
      });

      const board = Array.from({ length: 4 }).map(() =>
        Array.from({ length: 4 }).map(() =>
          Array.from({ length: 4 }).map(() => ESquareState.Empty),
        ),
      );

      const moves2 = await ctx.db.move.findMany({
        where: { gameId: input.id },
        orderBy: { createdAt: "asc" },
      });

      for (const move of moves2) {
        board[move.positionX]![move.positionY]![move.positionZ] =
          move.turn === Turn.LIGHT ? ESquareState.Light : ESquareState.Dark;
      }

      const res = checkIsWin(board);
      if (res?.result) {
        await ctx.db.game.update({
          where: { id: input.id },
          data: { state: res.result },
        });
      }

      return move;
    }),

  // onMove: protectedProcedure
  //   .input(z.object({ id: z.string().uuid() }))
  //   .subscription(() => {
  //     return observable((emit) => {
  //       const onMove = (data: Move) => {
  //         console.log("onMove", data);
  //         // return data;
  //         emit.next(data);
  //       };

  //       ee.on("onMove", onMove);
  //       return () => {
  //         ee.off("onMove", onMove);
  //       };
  //     });
  //   }),

  join: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const game = await ctx.db.game.findUnique({ where: { id: input.id } });
      if (!game) throw new TRPCError({ code: "NOT_FOUND" });

      // Check if game is waiting for players
      if (game.state !== GameState.WAITINGFORPLAYERS)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sorry! This game already started!",
        });

      // Check if user is already in game
      if (
        game.whiteUserId === ctx.session.user.id ||
        game.blackUserId === ctx.session.user.id
      )
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already in this game!",
        });

      // Check if game is full
      if (game.whiteUserId && game.blackUserId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sorry! This game is full!",
        });

      // Check if user is already in another game
      const userGames = await ctx.db.game.findMany({
        where: {
          AND: [
            {
              OR: [
                { state: GameState.WAITINGFORPLAYERS },
                { state: GameState.PLAYING },
              ],
            },
            {
              OR: [
                { whiteUserId: ctx.session.user.id },
                { blackUserId: ctx.session.user.id },
              ],
            },
          ],
        },
      });
      if (userGames.length > 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have an active game",
        });

      // Update game
      const data = {
        state: GameState.PLAYING,
        whiteUserId: game.whiteUserId ? game.whiteUserId : ctx.session.user.id,
        blackUserId: game.blackUserId ? game.blackUserId : ctx.session.user.id,
      };
      const updatedGame = await ctx.db.game.update({
        where: { id: input.id },
        data,
      });

      return updatedGame.id;
    }),

  // onOpponentJoin: protectedProcedure
  //   .input(z.object({ id: z.string().uuid() }))
  //   .subscription(() => {
  //     return observable((emit) => {
  //       const onOpponentJoin = (data: Game) => {
  //         console.log("onOpponentJoin", data);
  //         // return data;
  //         emit.next(data);
  //       };

  //       ee.on("onOpponentJoin", onOpponentJoin);
  //       return () => {
  //         ee.off("onOpponentJoin", onOpponentJoin);
  //       };
  //     });
  //   }),

  // randomNumber: protectedProcedure.subscription(() => {
  //   return observable<{ randomNumber: number }>((emit) => {
  //     const timer = setInterval(() => {
  //       emit.next({ randomNumber: Math.random() });
  //     }, 1000);
  //     return () => {
  //       clearInterval(timer);
  //     };
  //   });
  // }),

  // onUpdate: protectedProcedure
  // .input(z.object({ id: z.string() }))
  // .subscription(async ({ ctx, input }) => {
  //   const game = await ctx.db.game.findUnique({ where: { id: input.id } });
  //   if (!game) throw new TRPCError({ code: 'NOT_FOUND' });

  //   return ctx.subscription('game', { where: { id: input.id } }).pipe(
  //     map((updatedGame) => ({
  //       type: 'gameUpdate',
  //       payload: updatedGame,
  //     })),
  //   );
  // }),
});
