import Head from "next/head";
import React, { useState } from "react";

import { Game, GameRefType } from "~/components/3D/Game";
import GameLayout from "~/components/layouts/GameLayout";

const PVPGame: React.FC<{ id: string }> = ({ id }) => {
  const gameRef = React.useRef<GameRefType>(null);
  const [state, setState] = useState({
    topText: "",
    playerToMove: "LIGHT",
    isGameEnd: false,
  });

  return (
    <GameLayout>
      <div className="h-screen w-screen">
        <Game
          ref={gameRef}
          onPlacePiece={(pos) => gameRef.current?.addPiece(pos.x, pos.y, pos.z)}
          canMove={!state.isGameEnd}
          onDarkMove={() =>
            setState((prevState) => ({
              ...prevState,
              topText: "",
              playerToMove: "LIGHT",
            }))
          }
          onLightMove={(board) => {
            setState((prevState) => ({
              ...prevState,
              topText: "...",
              playerToMove: "DARK",
            }));
          }}
          onDarkWin={() =>
            setState((prevState) => ({
              ...prevState,
              topText: "Dark player wins!",
            }))
          }
          onLightWin={() =>
            setState((prevState) => ({
              ...prevState,
              topText: "Light player wins!",
            }))
          }
          onWin={() =>
            setState((prevState) => ({ ...prevState, isGameEnd: true }))
          }
        />
      </div>
      {!state.isGameEnd && (
        <div
          className={`absolute top-8 h-8 w-8 rounded-2xl outline outline-2 outline-offset-2 ${
            state.playerToMove === "LIGHT"
              ? "bg-white outline-white/50"
              : "bg-black outline-black/50"
          }`}
        ></div>
      )}
      <p className="absolute top-8 text-center font-bold uppercase">
        {state.topText}
      </p>
    </GameLayout>
  );
};

export default PVPGame;
