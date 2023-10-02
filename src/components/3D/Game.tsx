import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React, { forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { BakeShadows, CameraControls, SoftShadows } from "@react-three/drei";

import { api } from "~/utils/api";
import { Canvas, useFrame } from "@react-three/fiber";
import { BoardWithPieces } from "~/components/3D/BoardWithPieces";
import { BoardSelections } from "~/components/3D/BoardSelections";
import { Piece } from "~/components/3D/Piece";
import { getNextPieceHeight } from "~/utils/getNextPieceHeight";
import { CSpotLight, CAmbientLight } from "~/components/3D/Lights";
// import { PieceInstance } from "~/components/Pieces/PieceInstance";
import { GameState, Turn } from "@prisma/client";
import { TGameData, ESquareState } from "~/types/game.types";
import { checkIsWin } from "~/utils/checkIsWin";
import { handleError } from "~/utils/handleError";

const SETTINGS = {
  SHADOW_QUALITY: 3, // 0 - off, 1 - on, 2 - soft shadows, 3 - high quality soft shadows
};

export type GameRefType = {
  reset: () => void;
  addPiece: (x: number, y: number, z: number) => void;
};

const recording: THREE.Vector2[] = [];

const Game = forwardRef<
  GameRefType,
  {
    gameData?: TGameData;
    enableBot?: boolean;
    onDarkWin?: () => void;
    onLightWin?: () => void;
    onDarkMove?: () => void;
    onLightMove?: () => void;
    onWin?: (
      result: typeof GameState.DARKWIN | typeof GameState.LIGHTWIN,
    ) => void;
    canMove?: boolean;
    onPlacePiece: (pos: THREE.Vector3) => void;
    playerTurn?: Turn;
  }
>(
  (
    {
      onPlacePiece,
      canMove,
      enableBot = false,
      onDarkWin,
      onLightWin,
      onWin,
      onLightMove,
      onDarkMove,
    },
    ref,
  ) => {
    const { mutate: mutateBotMove, isLoading: isLoadingBotMove } =
      api.game.getBotMove.useMutation({
        onSuccess: (move) => {
          if (move) {
            addPiece(new THREE.Vector3(move.x, move.y, move.z));
          }
        },
        onError: (e) => handleError(e),
      });
    const [gameData, setGameData] = React.useState<TGameData>({
      state: GameState.PLAYING,
      turn: Turn.LIGHT,
      board: Array.from({ length: 4 }).map(() =>
        Array.from({ length: 4 }).map(() =>
          Array.from({ length: 4 }).map(() => ESquareState.Empty),
        ),
      ),
    });

    const addPiece = (positionVector: THREE.Vector3) => {
      setGameData((prevState: TGameData) => {
        if (prevState.state !== GameState.PLAYING) return prevState;

        const pieceHeight =
          positionVector.z < 0 ||
          typeof positionVector.z !== "number" ||
          positionVector.z > 3
            ? getNextPieceHeight(prevState, positionVector.x, positionVector.y)
            : positionVector.z;
        if (pieceHeight > 3) return prevState;

        // Check if piece is already there
        if (
          prevState.board[positionVector.x]![positionVector.y]![pieceHeight] !==
          ESquareState.Empty
        )
          return prevState;

        const newState: TGameData = structuredClone(prevState);

        newState.board[positionVector.x]![positionVector.y]![pieceHeight] =
          prevState.turn == Turn.LIGHT ? ESquareState.Light : ESquareState.Dark;

        const isWin = checkIsWin(newState.board);
        if (isWin) {
          console.log("There is a win");
          console.log(isWin);
          if (isWin.winningCoordinates) {
            isWin.winningCoordinates.forEach((coord) => {
              newState.board[coord.x]![coord.y]![coord.z] =
                isWin.result == GameState.LIGHTWIN
                  ? ESquareState.LightHighlighted
                  : ESquareState.DarkHighlighted;
            });
            if (isWin.result == GameState.LIGHTWIN && onLightWin) {
              onLightWin();
            }
            if (isWin.result == GameState.DARKWIN && onDarkWin) {
              onDarkWin();
            }
            if (onWin) {
              onWin(isWin.result);
            }
          }
          newState.state = isWin.result;
        } else {
          if (newState.turn == Turn.LIGHT) {
            newState.turn = Turn.DARK;
            if (onDarkMove) onDarkMove();
          } else {
            newState.turn = Turn.LIGHT;
            if (onLightMove) onLightMove();
          }
        }

        if (enableBot && newState.turn == Turn.DARK) {
          mutateBotMove({
            board: newState.board,
            color: newState.turn,
          });
        } else if (enableBot && newState.turn == Turn.LIGHT) {
          // mutateBotMove({
          //   board: newState.board,
          //   color: newState.turn,
          // });
        }

        return newState;
      });
    };

    const removePiece = (positionVector: THREE.Vector2) => {
      setGameData((prevState) => {
        if (
          gameData.state !== GameState.ANIMATING &&
          gameData.state !== GameState.PLAYING
        )
          return prevState;
        const newState = structuredClone(prevState);
        const pieceHeight = getNextPieceHeight(
          newState,
          positionVector.x,
          positionVector.y,
        );
        if (pieceHeight < 0) return prevState;
        newState.board[positionVector.x]![positionVector.y]![pieceHeight - 1] =
          ESquareState.Empty;
        return newState;
      });
    };

    const setLightWin = () => {
      setGameData((prevState) => {
        const newState = structuredClone(prevState);
        newState.state = GameState.LIGHTWIN;
        return newState;
      });
    };

    const setDarkWin = () => {
      setGameData((prevState) => {
        const newState = structuredClone(prevState);
        newState.state = GameState.DARKWIN;
        return newState;
      });
    };

    useImperativeHandle(ref, () => ({
      reset() {
        setGameData(() => ({
          state: GameState.PLAYING,
          turn: Turn.LIGHT,
          board: Array.from({ length: 4 }).map(() =>
            Array.from({ length: 4 }).map(() =>
              Array.from({ length: 4 }).map(() => ESquareState.Empty),
            ),
          ),
        }));
      },
      addPiece(x: number, y: number, z: number) {
        addPiece(new THREE.Vector3(x, y, z));
      },
    }));

    return (
      <Canvas shadows>
        <CSpotLight
          position={[3, 3, 3]}
          visible={true}
          color={"#FFDDB5"}
          intensity={50}
          castShadow={true}
        />
        <CSpotLight
          position={[-3, 4, 3]}
          visible={true}
          color={"#FFDDB5"}
          intensity={50}
          castShadow={true}
        />

        <CAmbientLight color={"#FFDDB5"} intensity={0.7} />

        <CameraControls
          maxPolarAngle={Math.PI / 2}
          truckSpeed={0}
          minDistance={3}
          maxDistance={15}
        />
        <React.Suspense fallback={null}>
          <BoardWithPieces />
          {gameData.board.map((row, i) => {
            return row.map((col, j) => {
              return col
                .filter((square) => square !== ESquareState.Empty)
                .map((square, k) => {
                  return (
                    <Piece
                      key={`${i}${j}${k}`}
                      pos={new THREE.Vector3(i, j, k)}
                      square={square}
                    />
                  );
                });
            });
          })}
          {SETTINGS.SHADOW_QUALITY > 1 && (
            <SoftShadows
              size={60}
              samples={SETTINGS.SHADOW_QUALITY >= 3 ? 16 : 8}
              focus={0.5}
            />
          )}
          {SETTINGS.SHADOW_QUALITY == 0 && <BakeShadows />}
          {canMove && <BoardSelections addPiece={onPlacePiece} />}
        </React.Suspense>
      </Canvas>
    );
  },
);

Game.displayName = "Game";
export { Game };
