import Head from "next/head";
import React, { useState } from "react";

import { Game, GameRefType } from "~/components/3D/Game";
import GameLayout from "~/components/layouts/GameLayout";

const PVPGame: React.FC<{ id: string }> = ({ id }) => {
  const gameRef = React.useRef<GameRefType>(null);

  const [topText, setTopText] = useState("Light player to move");
  const [isGameEnd, setIsGameEnd] = useState(false);

  return (
    <GameLayout>
      <div className="h-screen w-screen">
        <Game
          ref={gameRef}
          onPlacePiece={(pos) => gameRef.current?.addPiece(pos.x, pos.y, pos.z)}
          canMove={!isGameEnd}
          onDarkMove={() => setTopText("Dark player to move")}
          onLightMove={() => setTopText("Light player to move")}
          onDarkWin={() => setTopText("Dark player wins!")}
          onLightWin={() => setTopText("Light player wins!")}
          onWin={() => setIsGameEnd(true)}
        />
      </div>
      <p className="absolute top-8 text-center font-bold uppercase">
        {topText}
      </p>
    </GameLayout>
  );
};

export default PVPGame;
