
import { EGameState, TGameData, ESquareState, EPlayer } from "~/utils/gameTypes";

export const checkIsWin = (data: TGameData): (EGameState.DarkWin | EGameState.LightWin | undefined) => {
    const gameData = JSON.parse(JSON.stringify(data)) as TGameData;
    if (!gameData) return undefined;
    if (gameData.state == EGameState.DarkWin) return EGameState.DarkWin;
    if (gameData.state == EGameState.LightWin) return EGameState.LightWin;
    if (gameData.state !== EGameState.Playing) return undefined;

    const board = gameData.board;

    const getPlaneSquareValue = (plane: ESquareState[][], x: number, y: number): ESquareState => {
        const row = plane[x];
        if (row === undefined) return ESquareState.Empty;
        const square = row[y];
        if (square === undefined) return ESquareState.Empty;
        return square;
    }

    const checkPlane = (plane: ESquareState[][]): (EGameState | undefined) => {
        // winningStates
        for (let i = 0; i < winningStates.length; i++) {
            let winningState = winningStates[i];
            if (!winningState) continue;
            // Check if light player has won
            const lightHasWon = winningState.filter((row, x) => {
                return row.some((piece, y) => {
                    const squareState = getPlaneSquareValue(plane, x, y);
                    if (piece === 1 && squareState === ESquareState.Light) return true;

                    return false;
                })
            }).length == 4;

            if (lightHasWon) {
                gameData.state = EGameState.LightWin;
                return EGameState.LightWin;
            }

            // Check if dark player has won
            const darkHasWon = winningState.filter((row, x) => {
                return row.some((piece, y) => {
                    const squareState = getPlaneSquareValue(plane, x, y);
                    if (piece === 1 && squareState === ESquareState.Dark) return true;

                    return false;
                })
            }).length == 4;

            if (darkHasWon) {
                gameData.state = EGameState.DarkWin;
                return EGameState.DarkWin;
            }
        }
    }

    const getBoardSquare = (board: (ESquareState|undefined)[][][], x: number, y: number, z: number): ESquareState | undefined => {
        const column = board[x];
        if (column === undefined) return undefined;
        const row = column[y];
        if (row === undefined) return undefined;
        const square = row[z];
        if (square === undefined) return undefined;
        return square;
    }
    
    const setPlaneSquare = (plane: (ESquareState)[][], x: number, y: number, squareState: ESquareState): ESquareState[][] => {
        const row = plane[x];
        if (row === undefined) return plane;
        const square = row[y];
        if (square === undefined) return plane;

        const newPlane = [...plane];
        const newRow = [...row];
        newRow[y] = squareState;
        newPlane[x] = newRow;
        
        return newPlane;
    }

    for (let z = 0; z < 4; z++) {
        let plane1: (ESquareState)[][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => ESquareState.Empty));
        let plane2: (ESquareState)[][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => ESquareState.Empty));
        let plane3: (ESquareState)[][] = new Array(4).fill(0).map(() => new Array(4).fill(0).map(() => ESquareState.Empty));
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const newValue1 = getBoardSquare(board, x, y, z);
                if (newValue1 !== undefined) plane1 = setPlaneSquare(plane1, x, y, newValue1);
                const newValue2 = getBoardSquare(board, y, z, x);
                if (newValue2 !== undefined) plane2 = setPlaneSquare(plane2, x, y, newValue2);
                const newValue3 = getBoardSquare(board, z, x, y);
                if (newValue3 !== undefined) plane3 = setPlaneSquare(plane3, x, y, newValue3);
            }
        }
        const planeResult1 = checkPlane(plane1);
        if (planeResult1) return planeResult1;
        const planeResult2 = checkPlane(plane2);
        if (planeResult2) return planeResult2;
        const planeResult3 = checkPlane(plane3);
        if (planeResult3) return planeResult3;
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

