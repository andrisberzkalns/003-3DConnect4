// import { ESquareState } from "~/types/game.types";

// const SCORE_VALUES = {
//   // BLOCK_WIN: 100000,
//   // BLOCK_FORK: 10000,
//   // BLOCK_THREE: 1000,
//   // BLOCK_TWO: 100,
//   // BLOCK_ONE: 10,
//   ONE: 1,
//   TWO: 10,
//   THREE: 100,
//   FORK: 1000,
//   WINNING_FORK: 10000,
//   WIN: 1000000,
// };

// type TAnalysisResponse = {
//   light: {
//     score: number;
//     winCount: number;
//     threeCount: number;
//     twoCount: number;
//     oneCount: number;
//   };
//   dark: {
//     score: number;
//     winCount: number;
//     threeCount: number;
//     twoCount: number;
//     oneCount: number;
//   };
// };

// const analyse = (board: ESquareState[][][]): TAnalysisResponse => {
//   const result = {
//     dark: {
//       score: 0,
//       winCount: 0,
//       threeCount: 0,
//       twoCount: 0,
//       oneCount: 0,
//     },
//     light: {
//       score: 0,
//       winCount: 0,
//       threeCount: 0,
//       twoCount: 0,
//       oneCount: 0,
//     },
//   };

//   // Get planes in all dimensions
//   const planes = [];
//   // Get all planes from board
//   for (let i = 0; i < board.length; i++) {
//     const plane = board[i];
//     planes.push(plane);
//     if (!plane) continue;
//     // Get all rows from planes
//     for (let j = 0; j < plane.length; j++) {
//       const row = plane[j];
//       planes.push(row);
//     }
//   }

//   return result;
// };

// const checkHorizontalPlane = (
//   plane: ESquareState[][],
// ): { lightScore: number; darkScore: number } => {
//   return {
//     lightScore: 0,
//     darkScore: 0,
//   };
// };

// const checkVerticalPlane = (
//   plane: ESquareState[][],
// ): { lightScore: number; darkScore: number } => {
//   const scores = {
//     lightScore: 0,
//     darkScore: 0,
//   };

//   const rows = [];
//   // Get all rows from planes
//   var diagonalRow1 = [];
//   var diagonalRow2 = [];
//   for (let i = 0; i < plane.length; i++) {
//     rows.push(plane[i]);
//     var verticalRow = [];
//     for (let j = 0; j < plane.length; j++) {
//       verticalRow.push(plane[j]![i]);
//     }
//     diagonalRow1.push(plane[i]![i]);
//     diagonalRow2.push(plane[i]![plane.length - 1 - i]);
//     rows.push(verticalRow);
//   }
//   rows.push(diagonalRow1);
//   rows.push(diagonalRow2);

//   for (let i = 0; i < rows.length; i++) {
//     const row = rows[i];
//     const lightScore = getRowScore(row, ESquareState.Light);
//     const darkScore = getRowScore(row, ESquareState.Dark);
//     scores.lightScore += lightScore;
//     scores.darkScore += darkScore;
//   }

//   return scores;
// };

// const getRowScore = (row: ESquareState[], color: ESquareState): number => {
//   if (isWin(row, color)) {
//     return SCORE_VALUES.WIN;
//   } else if (isOneScore(row, color)) {
//     return SCORE_VALUES.ONE;
//   } else if (isTwoScore(row, color)) {
//     return SCORE_VALUES.TWO;
//   } else if (isThreeScore(row, color)) {
//     return SCORE_VALUES.THREE;
//   } else {
//     return 0;
//   }
// };

// const getPlaneScore = (
//   plane: ESquareState[][],
//   color: ESquareState,
// ): { lightScore: number; darkScore: number } => {
//   const scores = {
//     lightScore: 0,
//     darkScore: 0,
//   };

//   const rows = [];
//   // Get all rows from planes
//   var diagonalRow1 = [];
//   var diagonalRow2 = [];
//   for (let i = 0; i < plane.length; i++) {
//     rows.push(plane[i]);
//     var verticalRow = [];
//     for (let j = 0; j < plane.length; j++) {
//       verticalRow.push(plane[j]![i]);
//     }
//     diagonalRow1.push(plane[i]![i]);
//     diagonalRow2.push(plane[i]![plane.length - 1 - i]);
//     rows.push(verticalRow);
//   }
//   rows.push(diagonalRow1);
//   rows.push(diagonalRow2);

//   for (let i = 0; i < rows.length; i++) {
//     const row = rows[i];
//     const lightScore = getRowScore(row, ESquareState.Light);
//     const darkScore = getRowScore(row, ESquareState.Dark);
//     scores.lightScore += lightScore;
//     scores.darkScore += darkScore;
//   }

//   return scores;
// };

// const isOneScore = (row: ESquareState[], color: ESquareState): boolean => {
//   const checkColor =
//     color === ESquareState.Light ? ESquareState.Dark : ESquareState.Light;
//   const opponentColor =
//     color === ESquareState.Light ? ESquareState.Light : ESquareState.Dark;

//   return (
//     row.filter((piece) => piece === checkColor).length === 1 &&
//     row.filter((piece) => piece === opponentColor).length === 0
//   );
// };

// const isTwoScore = (row: ESquareState[], color: ESquareState): boolean => {
//   const checkColor =
//     color === ESquareState.Light ? ESquareState.Dark : ESquareState.Light;
//   const opponentColor =
//     color === ESquareState.Light ? ESquareState.Light : ESquareState.Dark;

//   return (
//     row.filter((piece) => piece === checkColor).length === 2 &&
//     row.filter((piece) => piece === opponentColor).length === 0
//   );
// };

// const isThreeScore = (row: ESquareState[], color: ESquareState): boolean => {
//   const checkColor =
//     color === ESquareState.Light ? ESquareState.Dark : ESquareState.Light;
//   const opponentColor =
//     color === ESquareState.Light ? ESquareState.Light : ESquareState.Dark;

//   return (
//     row.filter((piece) => piece === checkColor).length === 3 &&
//     row.filter((piece) => piece === opponentColor).length === 0
//   );
// };

// const isForkScore = (plane: ESquareState[][], color: ESquareState): boolean => {
//   return false;
// };

// const isWinningForkScore = (
//   plane: ESquareState[][],
//   color: ESquareState,
// ): boolean => {
//   return false;
// };

// const isWin = (row: ESquareState[], color: ESquareState): boolean => {
//   return row.filter((piece) => piece === color).length === 4;
// };

// const isBlockWin = (row: ESquareState[], color: ESquareState): boolean => {
//   const opponentColor =
//     color === ESquareState.Light ? ESquareState.Dark : ESquareState.Light;

//   return (
//     row.filter((piece) => piece === opponentColor).length === 3 &&
//     row.filter((piece) => piece === color).length === 1
//   );
// };

// const isBlockFork = (row: ESquareState[], color: ESquareState): boolean => {
//   return false;
// };

// const isBlockThree = (row: ESquareState[], color: ESquareState): boolean => {
//   const opponentColor =
//     color === ESquareState.Light ? ESquareState.Light : ESquareState.Dark;

//   return (
//     row.filter((piece) => piece === opponentColor).length === 2 &&
//     row.filter((piece) => piece === color).length === 1
//   );
// };

// const isBlockTwo = (row: ESquareState[], color: ESquareState): boolean => {
//   const opponentColor =
//     color === ESquareState.Light ? ESquareState.Light : ESquareState.Dark;

//   return (
//     row.filter((piece) => piece === opponentColor).length === 1 &&
//     row.filter((piece) => piece === color).length === 1
//   );
// };

// const isBlockOne = (row: ESquareState[], color: ESquareState): boolean => {
//   const opponentColor =
//     color === ESquareState.Light ? ESquareState.Light : ESquareState.Dark;

//   return (
//     row.filter((piece) => piece === opponentColor).length === 1 &&
//     row.filter((piece) => piece === color).length === 0
//   );
// };
