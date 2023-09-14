import { TGameData } from '~/utils/gameTypes';

export const getNextPieceHeight = (gameState: TGameData, x: number, y: number): number => {
    if (!gameState?.board) return -1;
    return gameState.board[x]![y]!.filter((piece: number) => piece !== 0).length
}
