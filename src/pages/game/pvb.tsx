import React, { useState } from "react";

import { Game, GameRefType } from "~/components/3D/Game";
import { api } from "~/utils/api";
import { handleError } from "~/utils/handleError";
import GameLayout from "~/components/layouts/GameLayout";

const PVBGame: React.FC<{ id: string }> = ({ id }) => {
  const gameRef = React.useRef<GameRefType>(null);
  const { mutate: mutateBotMove, isLoading: isLoadingBotMove } =
    api.game.getBotMove.useMutation({
      onSuccess: (move) => {
        if (move) {
          console.log("Got bot move", move);
          gameRef.current?.addPiece(move.x, move.y, move.z);
        }
      },
      onError: (e) => handleError(e),
    });

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
          canMove={!state.isGameEnd && !isLoadingBotMove}
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
            mutateBotMove({
              board: board,
              color: "LIGHT",
            });
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
          className={`absolute top-8 h-8 w-8 animate-bounce rounded-2xl outline outline-2 outline-offset-2 ${
            state.playerToMove === "LIGHT"
              ? "bg-white outline-white/50"
              : "bg-black outline-black/50"
          }`}
        ></div>
      )}
      <p className="animate-text absolute top-8 select-none bg-gradient-to-r from-purple-500 via-orange-600 to-red-500 bg-clip-text text-2xl font-black text-transparent drop-shadow-md">
        {state.topText}
      </p>
    </GameLayout>
  );
};

export default PVBGame;
