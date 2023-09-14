export enum EGameState {
    Playing,
    Animating,
    LightWin,
    DarkWin,
}

export enum EPlayer {
    Light,
    Dark,
}

export enum ESquareState {
    Empty,
    Light,
    Dark,
    LightHighlighted,
    DarkHighlighted,
}

export type TGameData = {
    state: EGameState;
    board: ESquareState[][][];
    turn: EPlayer
}