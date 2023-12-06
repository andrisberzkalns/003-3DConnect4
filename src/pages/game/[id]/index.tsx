import Head from "next/head";
import React, { useEffect } from "react";

import { Game, GameRefType } from "~/components/3D/Game";
import { allRows } from "~/utils/recordings/allRows";
import { createClient } from "@supabase/supabase-js";
import router, { useRouter } from "next/router";
import { Database } from "~/types/database.types";
import toast from "react-hot-toast";
import { GameState, Move, Turn } from "@prisma/client";
import { api } from "~/utils/api";
import { handleError } from "~/utils/handleError";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Home } from "lucide-react";
import GameLayout from "~/components/layouts/GameLayout";
import z from "zod";
// const SETTINGS = {
//   SHADOW_QUALITY: 1, // 0 - off, 1 - on, 2 - soft shadows, 3 - high quality soft shadows
// };

const payloadSchema = z.object({
  eventType: z.string(),
  new: z.object({
    positionX: z.number(),
    positionY: z.number(),
    positionZ: z.number(),
  }),
});
type payloadSchema = z.infer<typeof payloadSchema>;

const client = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const GameContainer: React.FC<{ id: string }> = ({ id }) => {
  const gameRef = React.useRef<GameRefType>(null);
  const { data: session } = useSession();
  const { data: moves, isLoading: isLoadingMoves } = api.game.getMoves.useQuery(
    {
      gameId: id,
    },
  );
  const gameQuery = api.game.get.useQuery({ id });
  const { mutate: mutateMove, isLoading: isLoadingMove } =
    api.game.move.useMutation({
      onSuccess: () => {
        // toast.success("Moved successfully.");
      },
      onError: (e) => handleError(e),
    });

  useEffect(() => {
    if (!moves) return;
    moves.forEach((move: Move, index: number) => {
      setTimeout(() => {
        gameRef?.current?.addPiece(
          move.positionX,
          move.positionY,
          move.positionZ,
        );
      }, index * 50);
    });
  }, [moves]);

  useEffect(() => {
    const channel = client
      .channel("game-move-db-changes" + id)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Game",
          filter: `id=eq.${id}`,
        },
        (payload: unknown) => {
          const validatedPayload = payloadSchema.safeParse(payload);
          console.log("Change received!", payload);
          // const { data } = payload;
          // console.log(payload);
          // On white win
          // if (data.state === GameState.LIGHTWIN) {
          //   toast.success("White won!");
          // }
          // // On black win
          // if (data.state === GameState.DARKWIN) {
          //   toast.success("Black won!");
          // }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Move",
          filter: `gameId=eq.${id}`,
        },
        (payload: unknown) => {
          const validatedPayload = payloadSchema.safeParse(payload);
          if (!validatedPayload.success) {
            console.error(validatedPayload.error);
            toast.error("Error parsing payload");
            return;
          }
          const { eventType, new: newMove } = payload as payloadSchema;

          console.log("Change received!", payload);
          if (eventType === "INSERT") {
            void gameQuery.refetch();
            gameRef?.current?.addPiece(
              newMove.positionX,
              newMove.positionY,
              newMove.positionZ,
            );
          }
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  const isMyTurn =
    (gameQuery.data?.turn == Turn.LIGHT &&
      gameQuery.data?.whiteUserId == session?.user.id) ||
    (gameQuery.data?.turn == Turn.DARK &&
      gameQuery.data?.blackUserId == session?.user.id);
  const isGameEnd =
    gameQuery.data?.state === GameState.LIGHTWIN ||
    gameQuery.data?.state === GameState.DARKWIN;

  const topText = isGameEnd
    ? gameQuery.data?.state === GameState.LIGHTWIN
      ? "Light won!"
      : "Dark won!"
    : isMyTurn
    ? "Your turn"
    : "Waiting for opponent";

  return (
    <GameLayout>
      <div className="h-screen w-screen">
        <Game
          ref={gameRef}
          onPlacePiece={(pos) =>
            mutateMove({ id: id, x: pos.x, y: pos.y, z: pos.z })
          }
          canMove={!isGameEnd && isMyTurn}
        />
      </div>
      <p className="absolute top-8 text-center font-bold uppercase">
        {topText}
      </p>
    </GameLayout>
  );
};

const GamePage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <></>;

  return <GameContainer id={id as string} />;
};

export default GamePage;
