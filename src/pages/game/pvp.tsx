import Head from "next/head";
import React, { useEffect, useState } from "react";

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

const PVPGame: React.FC<{ id: string }> = ({ id }) => {
  const gameRef = React.useRef<GameRefType>(null);

  const [topText, setTopText] = useState("Light player to move");
  const [isGameEnd, setIsGameEnd] = useState(false);

  return (
    <>
      <main className="flex min-h-screen bg-gradient-to-b from-yellow-500 to-orange-900">
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="h-screen w-screen">
            <Game
              ref={gameRef}
              onPlacePiece={(pos) =>
                gameRef.current?.addPiece(pos.x, pos.y, pos.z)
              }
              canMove={!isGameEnd}
              onDarkMove={() => setTopText("Dark player to move")}
              onLightMove={() => setTopText("Light player to move")}
              onDarkWin={() => setTopText("Dark player wins!")}
              onLightWin={() => setTopText("Light player wins!")}
              onWin={() => setIsGameEnd(true)}
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

export default PVPGame;
