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

// const SETTINGS = {
//   SHADOW_QUALITY: 1, // 0 - off, 1 - on, 2 - soft shadows, 3 - high quality soft shadows
// };

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

  const playRecording = () => {
    allRows.forEach((row, index) => {
      console.log(row);
      setTimeout(() => {
        gameRef?.current?.addPiece(row.x, row.y, -1);
      }, index * 15);
    });
  };

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
          const { eventType, new: newMove } = payload as {
            eventType: "INSERT" | "UPDATE" | "DELETE";
            new: Move;
          };

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
    <>
      <main className="flex min-h-screen bg-gradient-to-b from-yellow-500 to-orange-900">
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="h-screen w-screen">
            <Game
              ref={gameRef}
              onPlacePiece={(pos) =>
                mutateMove({ id: id, x: pos.x, y: pos.y, z: pos.z })
              }
              canMove={!isGameEnd && isMyTurn}
            />
          </div>
          {isGameEnd && (
            <div className="z-19 absolute left-8 top-8">
              <Button
                type="submit"
                className="w-full"
                onClick={() => {
                  void router.push("/");
                }}
              >
                <Home className="mr-4" /> Menu
              </Button>
            </div>
          )}
          <p className="absolute top-8 text-center font-bold uppercase">
            {topText}
          </p>
        </div>
        {/* <div className="absolute">
          <button onClick={() => gameRef?.current?.reset()}>Reset</button>
          <button onClick={() => playRecording()}>Set perfect game</button>
        </div> */}
      </main>
    </>
  );
};

const GamePage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <></>;

  return <GameContainer id={id as string} />;
};

export default GamePage;
