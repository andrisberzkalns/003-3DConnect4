import * as THREE from "three";
import { EGameState, TGameData, ESquareState, EPlayer } from "~/utils/gameTypes";

// const squareData: [THREE.Vector2, THREE.Vector3] = [new THREE.Vector2(1, 1), new THREE.Vector3(1, 1, 1)];
// const planeData: [THREE.Vector2, THREE.Vector3][][] = [];

export const checkIsWin = (data: TGameData): ({ result: EGameState.DarkWin | EGameState.LightWin, winningCoordinates?: THREE.Vector3[] } | undefined ) => {
    const gameData = JSON.parse(JSON.stringify(data)) as TGameData;
    if (!gameData) return undefined;
    if (gameData.state == EGameState.DarkWin) return { result: EGameState.DarkWin };
    if (gameData.state == EGameState.LightWin) return { result: EGameState.LightWin };
    if (gameData.state !== EGameState.Playing) return undefined;

    const board = gameData.board;

    const checkPlane = (plane: [ESquareState, THREE.Vector3][][]): { result: EGameState.DarkWin | EGameState.LightWin, winningStateIndex: number } | undefined => {
        // winningStates
        for (let i = 0; i < winningStates.length; i++) {
            const winningState = winningStates[i];
            if (!winningState) continue;
            // Check if light player has won
            const lightHasWon = winningState.filter((row, x) => {
                return row.some((piece, y) => piece === 1 && plane[x]![y]![0] === ESquareState.Light)
            }).length == 4;

            if (lightHasWon) {
                return { result: EGameState.LightWin, winningStateIndex: i };
            }

            // Check if dark player has won
            const darkHasWon = winningState.filter((row, x) => {
                return row.some((piece, y) => piece === 1 && plane[x]![y]![0] === ESquareState.Dark)
            }).length == 4;

            if (darkHasWon) {
                return { result: EGameState.DarkWin, winningStateIndex: i };
            }
        }
    }

    const getWinningPositions = (plane: [ESquareState, THREE.Vector3][][], winningStateIndex: number): THREE.Vector3[] => {
        const winningStatePlane = winningStates[winningStateIndex];
        const resultPositions: THREE.Vector3[] = [];

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

        return resultPositions;
    }

    // Diagonals
    const plane4: [ESquareState, THREE.Vector3][][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => [ESquareState.Empty, new THREE.Vector3(0,0,0)]));
    const plane5: [ESquareState, THREE.Vector3][][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => [ESquareState.Empty, new THREE.Vector3(0,0,0)]));
    for (let z = 0; z < 4; z++) {
        // Rows and columns
        const plane1: [ESquareState, THREE.Vector3][][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => [ESquareState.Empty, new THREE.Vector3(0,0,0)]));
        const plane2: [ESquareState, THREE.Vector3][][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => [ESquareState.Empty, new THREE.Vector3(0,0,0)]));
        const plane3: [ESquareState, THREE.Vector3][][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => [ESquareState.Empty, new THREE.Vector3(0,0,0)]));
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                plane1[x]![y] = [board[x]![y]![z]!, new THREE.Vector3(x,y,z)];
                plane2[x]![y] = [board[y]![z]![x]!, new THREE.Vector3(y,z,x)];
                plane3[x]![y] = [board[z]![x]![y]!, new THREE.Vector3(z,x,y)];
            }
            // Diagonals
            plane4[y]![z] = [board[y]![y]![z]!, new THREE.Vector3(y, y, z)];
            plane5[y]![z] = [board[y]![3-y]![z]!, new THREE.Vector3(y, 3-y, z)];
        }
        const planeResult1 = checkPlane(plane1);
        if (planeResult1) {
            return { result: planeResult1.result, winningCoordinates: getWinningPositions(plane1, planeResult1.winningStateIndex) }
        }
        const planeResult2 = checkPlane(plane2);
        if (planeResult2) {
            return { result: planeResult2.result, winningCoordinates: getWinningPositions(plane2, planeResult2.winningStateIndex) }
        }
        const planeResult3 = checkPlane(plane3);
        if (planeResult3) {
            return { result: planeResult3.result, winningCoordinates: getWinningPositions(plane3, planeResult3.winningStateIndex) }
        }
    }
    const planeResult4 = checkPlane(plane4);
    if (planeResult4) {
        return { result: planeResult4.result, winningCoordinates: getWinningPositions(plane4, planeResult4.winningStateIndex) }
    }
    const planeResult5 = checkPlane(plane5);
    if (planeResult5) {
        return { result: planeResult5.result, winningCoordinates: getWinningPositions(plane5, planeResult5.winningStateIndex) }
    }
}

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
]
