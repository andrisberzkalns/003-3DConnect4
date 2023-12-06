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
        console.log(gameRef.current);
        if (move) {
          console.log("Got bot move", move);
          gameRef.current?.addPiece(move.x, move.y, move.z);
        }
      },
      onError: (e) => handleError(e),
    });
  const [topText, setTopText] = useState("Light player to move");
  const [isGameEnd, setIsGameEnd] = useState(false);

  return (
    <GameLayout>
      <div className="h-screen w-screen">
        <Game
          ref={gameRef}
          onPlacePiece={(pos) => gameRef.current?.addPiece(pos.x, pos.y, pos.z)}
          canMove={!isGameEnd && !isLoadingBotMove}
          onDarkMove={() => setTopText("Light player to move")}
          onLightMove={(board) => {
            setTopText("Bot is thinking...");
            mutateBotMove({
              board: board,
              color: "LIGHT",
            });
          }}
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

export default PVBGame;
