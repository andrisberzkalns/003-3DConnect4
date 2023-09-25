import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React, { forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { CameraControls, SoftShadows } from "@react-three/drei";

import { api } from "~/utils/api";
import { Canvas, useFrame } from "@react-three/fiber";
import { BoardWithPieces } from "~/components/3D/BoardWithPieces";
import { BoardSelections } from "~/components/3D/BoardSelections";
import { Piece } from "~/components/3D/Piece";
import { getNextPieceHeight } from "~/utils/getNextPieceHeight";
import { CSpotLight, CAmbientLight } from "~/components/3D/Lights";
// import { PieceInstance } from "~/components/Pieces/PieceInstance";
import { GameState, Turn } from "@prisma/client";
import { TGameData, ESquareState } from "~/utils/gameTypes";
import { checkIsWin } from "~/utils/checkIsWin";

const SETTINGS = {
  SHADOW_QUALITY: 1, // 0 - off, 1 - on, 2 - soft shadows, 3 - high quality soft shadows
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
    onDarkWin?: () => void;
    onLightWin?: () => void;
    onWin?: (
      result: typeof GameState.DARKWIN | typeof GameState.LIGHTWIN,
    ) => void;
    canMove?: boolean;
    onPlacePiece: (pos: THREE.Vector3) => void;
    playerTurn?: Turn;
  }
>(({ onPlacePiece, canMove }, ref) => {
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
      if (newState.turn == Turn.LIGHT) {
        newState.turn = Turn.DARK;
      } else {
        newState.turn = Turn.LIGHT;
      }

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
        }
        newState.state = isWin.result;
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
        position={[3, 6, 3]}
        visible={true}
        color={"#FFDDB5"}
        intensity={100}
        castShadow={true}
      />
      <CSpotLight
        position={[-3, 6, 3]}
        visible={true}
        color={"#FFDDB5"}
        intensity={100}
        castShadow={true}
      />
      <CAmbientLight color={"#FFDDB5"} intensity={0.5} />

      {/* <PerspectiveCamera
        makeDefault
        position={[0, 0.8, 5]}
        fov={75}
        aspect={2}
        near={0.1}
        far={1000}
      /> */}
      <CameraControls />
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
          <SoftShadows size={60} samples={8} focus={0.5} />
        )}
        {/* <BakeShadows /> */}
        {canMove && <BoardSelections addPiece={onPlacePiece} />}
      </React.Suspense>
    </Canvas>
  );
});

Game.displayName = "Game";
export { Game };
