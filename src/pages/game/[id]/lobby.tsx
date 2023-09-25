import { createClient } from "@supabase/supabase-js";
import { Home } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Database } from "~/types/database.types";
import { api } from "~/utils/api";
import { GameState } from "@prisma/client";
import { TGameData } from "~/utils/gameTypes";

const client = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function GameLobby() {
  const router = useRouter();
  // Get id from url
  const { id = "" } = router.query;
  const { data: session } = useSession();

  const { data: game } = api.game.get.useQuery({
    id: id as string,
  });

  console.log(game);
  useEffect(() => {
    if (game?.state === GameState.PLAYING) {
      void router.push(`/game/${id.toString()}`);
    }
  }, [game]);

  useEffect(() => {
    const channel = client
      .channel("lobby" + id.toString())
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Game",
          filter: `id=eq.${id.toString()}`,
        },
        (payload: unknown) => {
          const { new: newValue } = payload as {
            new: TGameData;
          };
          console.log("Change received!", payload);
          if (newValue?.state === GameState.PLAYING) {
            toast.success("Opponent found!");
            void router.push(`/game/${id.toString()}`);
          } else {
            toast.error("Error occured while starting game!");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "Game",
          filter: `id=eq.${id.toString()}`,
        },
        (payload) => {
          console.log("Change received!", payload);
          toast.error("Game deleted!");
          void router.push(`/`);
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  if (!session) return <></>;

  return (
    <>
      <main className="bg-gradient-to-b from-yellow-500 to-orange-900">
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="absolute left-8 top-8">
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
          <div className="rounded-2xl bg-white px-5 py-2 text-center">
            <p>Waiting for opponent...</p>
          </div>
        </div>
      </main>
    </>
  );
}
