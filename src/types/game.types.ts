import type { GameState, Turn } from "@prisma/client";

export enum ESquareState {
  Empty,
  Light,
  Dark,
  LightHighlighted,
  DarkHighlighted,
}

export type TGameData = {
  state: GameState;
  board: ESquareState[][][];
  turn: Turn;
};
