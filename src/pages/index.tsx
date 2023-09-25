import { signIn, signOut, useSession } from "next-auth/react";
import { PlaySquare, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { GameState, Turn } from "@prisma/client";
import toast from "react-hot-toast";

import { createClient } from "@supabase/supabase-js";
import { Database } from "~/types/database.types";
import { handleError } from "~/utils/handleError";

const client = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type GameData = {
  id: string;
  createdAt: string;
  state: string;
  whiteUserId: string;
  blackUserId: string;
};

export default function Home() {
  // const { data: games, isLoading } = api.game.getWaiting.useQuery(void 0, {
  //   refetchInterval: 15000,
  // });
  // const { data: activeGame, isLoading: isActiveGameLoading } = api.game.myActiveGame.useQuery(void 0);

  // Get current user
  const [games, setGames] = React.useState<GameData[]>([]);

  const router = useRouter();
  const { data: session } = useSession();

  const { mutate: mutateJoin, isLoading: isJoining } =
    api.game.join.useMutation({
      onSuccess: (gameId) => {
        toast.success("Joining game...");
        if (gameId) {
          router.push(`/game/${gameId}`);
        }
      },
      onError: (e) => handleError(e),
    });

  const createGame = () => {
    router.push("/game/create");
  };

  const pvb = () => {
    router.push("/game/pvb");
  };

  const lpvp = () => {
    router.push("/game/lpvp");
  };

  const join = (id: string) => {
    // router.push(`/game/${id}/lobby`);
    mutateJoin({ id });
  };

  // const games: any[] = [];
  const isActiveGameLoading = false;
  const isLoading = false;

  const getTable = async () => {
    const { data } = await client
      .from("Game")
      .select(
        `id, createdAt, state, hostUserId (id, name, image), whiteUserId, blackUserId`,
      )
      .in("state", [GameState.WAITINGFORPLAYERS, GameState.PLAYING]);

    setGames(
      data?.map((game) => ({
        id: game.id,
        createdAt: game.createdAt,
        state: game.state,
        whiteUserId: game.whiteUserId ?? "",
        blackUserId: game.blackUserId ?? "",
      })) ?? [],
    );
  };

  // test

  const handleChangeEvent = (payload: unknown) => {
    const {
      old,
      new: newGame,
      eventType,
    } = payload as {
      table: string;
      eventType: "INSERT" | "UPDATE" | "DELETE";
      old: GameData;
      new: GameData;
    };

    if (eventType === "UPDATE") {
      setGames((previousState) =>
        previousState
          .map((game: GameData) =>
            game.id !== newGame.id
              ? game
              : {
                  id: newGame.id,
                  createdAt: newGame.createdAt,
                  state: newGame.state,
                  whiteUserId: newGame.whiteUserId,
                  blackUserId: newGame.blackUserId,
                },
          )
          .filter(
            (game: GameData) => game.state == GameState.WAITINGFORPLAYERS,
          ),
      );
    }

    if (eventType === "INSERT") {
      const isDuplicate = games.some(
        (game: GameData) => game.id === newGame.id,
      );

      if (!isDuplicate) {
        setGames((previousState: GameData[]) =>
          [
            ...previousState,
            {
              id: newGame.id,
              createdAt: newGame.createdAt,
              state: newGame.state,
              whiteUserId: newGame.whiteUserId,
              blackUserId: newGame.blackUserId,
            },
          ].filter(
            (game: GameData) => game.state == GameState.WAITINGFORPLAYERS,
          ),
        );
      }
    }

    if (eventType === "DELETE") {
      setGames((previousState: GameData[]) =>
        previousState.filter((game: GameData) => game.id !== old?.id),
      );
    }
  };

  useEffect(() => {
    getTable().catch(() => {
      toast.error("Error fetching games");
    });
    const channel = client
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Game",
        },
        (payload: unknown) => handleChangeEvent(payload),
      )
      .subscribe();

    return () => {
      client.removeChannel(channel).catch(() => {
        toast.error("Error unsubscribing from table");
      });
    };
  }, []);

  if (!games) {
    return <></>;
  }

  const joinableGames = games.filter(
    (game) =>
      game.state === GameState.WAITINGFORPLAYERS &&
      game.whiteUserId !== session?.user.id &&
      game.blackUserId !== session?.user.id,
  );

  const activeGame = session
    ? games.find(
        (game) =>
          (game.whiteUserId == session?.user.id ||
            game.blackUserId == session?.user.id) &&
          (game.state === "PLAYING" || game.state === "WAITINGFORPLAYERS"),
      )
    : null;

  const canJoin = session && !activeGame;
  const canCreate = session && !activeGame;

  return (
    <main className="bg-gradient-to-b from-yellow-500 to-orange-900">
      <div className="container grid min-h-screen grid-cols-1 place-content-start gap-8 lg:grid-cols-[29%_69%] lg:p-8">
        <div className="col-span-1 text-center lg:col-span-2">
          <h1 className="p-4 text-2xl font-black text-white drop-shadow-lg">
            3D Connect 4
          </h1>
          {activeGame && (
            <div className="flex">
              <Button
                className="flex-auto shadow-md"
                variant="destructive"
                onClick={() => {
                  if (activeGame.state === "PLAYING") {
                    router.push(`/game/${activeGame.id}`);
                  } else if (activeGame.state === "WAITINGFORPLAYERS") {
                    router.push(`/game/${activeGame.id}/lobby`);
                  }
                }}
              >
                Rejoin my game
              </Button>
              <Button className="ml-4 inline shadow-md">Abandon</Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 pt-4">
          {session ? (
            <Button
              className="border-1 mb-8"
              onClick={() => void signOut()}
              variant="secondary"
            >
              Log out
            </Button>
          ) : (
            <Button className="border-1 mb-8" onClick={() => void signIn()}>
              Login / Register
            </Button>
          )}
          <Button disabled={!canCreate} onClick={() => pvb()}>
            Player vs Bot
          </Button>
          <Button disabled={!canCreate} onClick={() => lpvp()}>
            Local Player vs Player
          </Button>
        </div>

        <div className="rounded-lg bg-white p-4">
          {session && !isActiveGameLoading && (
            <div className="grid  w-full flex-row">
              <Button disabled={!canCreate} onClick={() => createGame()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create a game
              </Button>
            </div>
          )}

          <Table>
            <TableCaption>A list of games waiting to be played</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]"></TableHead>
                <TableHead>Play as</TableHead>
                {/* <TableHead>Opponent</TableHead> */}
                <TableHead className="text-right">Created at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                !joinableGames?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No games found
                    </TableCell>
                  </TableRow>
                )
              )}
              {joinableGames?.map((val, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <Button
                      disabled={!canJoin}
                      title={!session ? "Must login to join" : "Join game"}
                      onClick={() => join(val.id)}
                    >
                      Join
                    </Button>
                  </TableCell>
                  <TableCell>
                    {val.whiteUserId ? Turn.DARK : Turn.LIGHT}
                  </TableCell>
                  {/* <TableCell className="flex object-center">
                    {val.hostUserId.image && (
                      <div className="inline-block">
                        <Avatar>
                          <AvatarImage src={val.hostUserId.image} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <div className="ml-4 inline-block self-center">
                      {val.hostUserId.name}
                    </div>
                  </TableCell> */}
                  <TableCell className="text-right">
                    {`${new Date(val.createdAt).toLocaleTimeString("en-UK", {
                      hour12: false,
                    })}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
