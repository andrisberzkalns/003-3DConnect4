import * as THREE from "three";
import { GameState } from "@prisma/client";
import { TGameData, ESquareState } from "~/utils/gameTypes";

type checkIsWinReturnType =
  | {
      result: typeof GameState.DARKWIN | typeof GameState.LIGHTWIN;
      winningCoordinates?: THREE.Vector3[];
      winRows?: number;
    }
  | undefined;

type checkPlaneReturnType =
  | {
      result: typeof GameState.DARKWIN | typeof GameState.LIGHTWIN;
      winningStateIndexes: number[];
    }
  | undefined;

const checkPlane = (
  plane: [ESquareState, THREE.Vector3][][],
): checkPlaneReturnType => {
  // winningStates
  let result: typeof GameState.DARKWIN | typeof GameState.LIGHTWIN | null =
    null;
  const winningStateIndexes: number[] = [];
  for (let i = 0; i < winningStates.length; i++) {
    const winningState = winningStates[i];
    if (!winningState) continue;
    // Check if light player has won
    const lightHasWon =
      winningState.filter((row, x) => {
        return row.some(
          (piece, y) => piece === 1 && plane[x]![y]![0] === ESquareState.Light,
        );
      }).length == 4;

    if (lightHasWon) {
      result = GameState.LIGHTWIN;
      winningStateIndexes.push(i);
    }

    // Check if dark player has won
    const darkHasWon =
      winningState.filter((row, x) => {
        return row.some(
          (piece, y) => piece === 1 && plane[x]![y]![0] === ESquareState.Dark,
        );
      }).length == 4;

    if (darkHasWon) {
      result = GameState.DARKWIN;
      winningStateIndexes.push(i);
    }
  }

  if (!result) {
    return;
  }
  return {
    result,
    winningStateIndexes,
  };
};

const getWinningPositions = (
  plane: [ESquareState, THREE.Vector3][][],
  winningStateIndexes: number[],
): THREE.Vector3[] => {
  const resultPositions: THREE.Vector3[] = [];
  for (const winningStateIndex of winningStateIndexes) {
    if (!winningStateIndex) continue;
    const winningStatePlane = winningStates[winningStateIndex];

    for (let x = 0; x < 4; x++) {
      const row = winningStatePlane![x];
      for (let y = 0; y < 4; y++) {
        const square = row![y];
        if (square === 1) {
          const squareState = plane[x]![y]![0];
          if (squareState !== ESquareState.Empty) {
            resultPositions.push(plane[x]![y]![1]);
          }
        }
      }
    }
  }

  return resultPositions;
};

const create2DPlane = (size: number): [ESquareState, THREE.Vector3][][] => {
  return new Array(size)
    .fill(0)
    .map(() =>
      new Array(size)
        .fill(0)
        .map(() => [ESquareState.Empty, new THREE.Vector3(0, 0, 0)]),
    );
};

export const checkIsWin = (board: TGameData["board"]): checkIsWinReturnType => {
  // const gameData = structuredClone(data);
  let winRows = 0;
  // if (!gameData) return undefined;
  // if (gameData.state == GameState.DARKWIN) {
  //   return { result: GameState.DARKWIN };
  // }
  // if (gameData.state == GameState.LIGHTWIN) {
  //   return { result: GameState.LIGHTWIN };
  // }
  // if (gameData.state !== GameState.PLAYING) return;

  // const board = gameData.board;
  let result: typeof GameState.DARKWIN | typeof GameState.LIGHTWIN | null =
    null;
  let winningCoordinates: THREE.Vector3[] = [];

  // Diagonals
  const plane4 = create2DPlane(4);
  const plane5 = create2DPlane(4);
  for (let z = 0; z < 4; z++) {
    // Rows and columns
    const plane1 = create2DPlane(4);
    const plane2 = create2DPlane(4);
    const plane3 = create2DPlane(4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        plane1[x]![y] = [board[x]![y]![z]!, new THREE.Vector3(x, y, z)];
        plane2[x]![y] = [board[y]![z]![x]!, new THREE.Vector3(y, z, x)];
        plane3[x]![y] = [board[z]![x]![y]!, new THREE.Vector3(z, x, y)];
      }
      // Diagonals
      plane4[y]![z] = [board[y]![y]![z]!, new THREE.Vector3(y, y, z)];
      plane5[y]![z] = [board[y]![3 - y]![z]!, new THREE.Vector3(y, 3 - y, z)];
    }

    const planeResult1 = checkPlane(plane1);
    if (planeResult1) {
      result = planeResult1.result;
      winRows += planeResult1.winningStateIndexes.length;
      winningCoordinates = winningCoordinates.concat(
        getWinningPositions(plane1, planeResult1.winningStateIndexes),
      );
    }
    const planeResult2 = checkPlane(plane2);
    if (planeResult2) {
      result = planeResult2.result;
      winRows += planeResult2.winningStateIndexes.length;
      winningCoordinates = winningCoordinates.concat(
        getWinningPositions(plane2, planeResult2.winningStateIndexes),
      );
    }
    const planeResult3 = checkPlane(plane3);
    if (planeResult3) {
      result = planeResult3.result;
      winRows += planeResult3.winningStateIndexes.length;
      winningCoordinates = winningCoordinates.concat(
        getWinningPositions(plane3, planeResult3.winningStateIndexes),
      );
    }
  }
  const planeResult4 = checkPlane(plane4);
  if (planeResult4) {
    result = planeResult4.result;
    winRows += planeResult4.winningStateIndexes.length;
    winningCoordinates = winningCoordinates.concat(
      getWinningPositions(plane4, planeResult4.winningStateIndexes),
    );
  }
  const planeResult5 = checkPlane(plane5);
  if (planeResult5) {
    result = planeResult5.result;
    winRows += planeResult5.winningStateIndexes.length;
    winningCoordinates = winningCoordinates.concat(
      getWinningPositions(plane5, planeResult5.winningStateIndexes),
    );
  }
  if (!result) {
    return;
  }

  return { result, winningCoordinates, winRows };
};

const winningStates = [
  // Horizontal
  [
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  // Vertical
  [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ],
  [
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
  ],
  // Diagonal
  [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ],
  [
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [1, 0, 0, 0],
  ],
];
