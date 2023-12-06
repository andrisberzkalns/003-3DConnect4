import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React, { forwardRef, useCallback, useImperativeHandle } from "react";
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
import { SettingsContext, ShadowQuality } from "~/contexts/settingsContext";

const SETTINGS = {
  SHADOW_QUALITY: 1, // 0 - off, 1 - on, 2 - soft shadows, 3 - high quality soft shadows
};

export type GameRefType = {
  reset: () => void;
  addPiece: (x: number, y: number, z: number) => void;
};

const recording: THREE.Vector2[] = [];

type GameProps = {
  gameData?: TGameData;
  onDarkWin?: () => void;
  onLightWin?: () => void;
  onDarkMove?: (board: TGameData["board"]) => void;
  onLightMove?: (board: TGameData["board"]) => void;
  onWin?: (
    result: typeof GameState.DARKWIN | typeof GameState.LIGHTWIN,
  ) => void;
  canMove?: boolean;
  onPlacePiece: (pos: THREE.Vector3) => void;
};

const Game = forwardRef<GameRefType, GameProps>((props, ref) => {
  const {
    onPlacePiece,
    canMove,
    onDarkWin,
    onLightWin,
    onWin,
    onLightMove,
    onDarkMove,
  } = props;
  const settings = React.useContext(SettingsContext);

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
    let prevState: TGameData = gameData;
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
        if (onLightMove) onLightMove(newState.board);
      } else {
        newState.turn = Turn.LIGHT;
        if (onDarkMove) onDarkMove(newState.board);
      }
    }

    setGameData(newState);
  };

  const removePiece = (positionVector: THREE.Vector2) => {
    let prevState: TGameData = gameData;
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

    setGameData(newState);
  };

  useImperativeHandle(
    ref,
    () => ({
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
    }),
    [addPiece],
  );

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
        {["medium", "high"].includes(settings.shadowQuality) && (
          <SoftShadows
            size={60}
            samples={settings.shadowQuality == "high" ? 16 : 8}
            focus={0.5}
          />
        )}
        {["off"].includes(settings.shadowQuality) && <BakeShadows />}
        {canMove && <BoardSelections addPiece={onPlacePiece} />}
      </React.Suspense>
    </Canvas>
  );
});

Game.displayName = "Game";
export { Game };
