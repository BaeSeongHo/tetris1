import { useState, useEffect } from 'react';
import { createStage, StageType, CellState, checkCollision } from '../utils/gameHelpers';

export const useBoard = (
  player: { pos: { x: number; y: number }; tetromino: any[][]; collided: boolean },
  resetPlayer: () => void
): [StageType, React.Dispatch<React.SetStateAction<StageType>>, number] => {
  const [board, setBoard] = useState(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);

  useEffect(() => {
    setRowsCleared(0);

    const sweepRows = (newBoard: StageType) =>
      newBoard.reduce((ack, row) => {
        if (row.findIndex(cell => cell[0] === 0) === -1) {
          setRowsCleared(prev => prev + 1);
          // Add a new empty row at top
          ack.unshift(new Array(newBoard[0].length).fill([0, 'clear']) as CellState[]);
          return ack;
        }
        ack.push(row);
        return ack;
      }, [] as StageType);

    const updateBoard = (prevBoard: StageType): StageType => {
      // First flush the board
      const newBoard = prevBoard.map(row =>
        row.map(cell => (cell[1] === 'clear' || cell[1] === 'ghost' ? [0, 'clear'] : cell))
      ) as StageType;

      // Draw ghost piece first
      let ghostY = 0;
      if (player.tetromino.some(row => row.some(cell => cell !== 0))) {
        while (!checkCollision(player, newBoard, { x: 0, y: ghostY })) {
          ghostY++;
        }
        ghostY--;
      } else {
        ghostY = -1;
      }

      if (ghostY >= 0) {
        player.tetromino.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              const boardY = y + player.pos.y + ghostY;
              const boardX = x + player.pos.x;
              if (newBoard[boardY] && newBoard[boardY][boardX]) {
                newBoard[boardY][boardX] = [value, 'ghost'];
              }
            }
          });
        });
      }

      // Then draw the tetromino
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            // Avoid out of bounds if y coordinate drops below board
            if (newBoard[y + player.pos.y]) {
                newBoard[y + player.pos.y][x + player.pos.x] = [
                value,
                player.collided ? 'merged' : 'clear',
                ];
            }
          }
        });
      });

      // Check if we collided
      if (player.collided) {
        resetPlayer();
        return sweepRows(newBoard);
      }

      return newBoard;
    };

    setBoard(prev => updateBoard(prev));
  }, [player, resetPlayer]);

  return [board, setBoard, rowsCleared];
};
