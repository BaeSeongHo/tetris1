export type TetrominoType = 0 | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export const TETROMINOES = {
  0: { shape: [[0]], color: 'bg-transparent border-transparent' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0]
    ],
    color: 'bg-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0]
    ],
    color: 'bg-blue-500 border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.8)]',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L']
    ],
    color: 'bg-orange-500 border-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.8)]',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O']
    ],
    color: 'bg-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.8)]',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500 border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.8)]',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0]
    ],
    color: 'bg-purple-500 border-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.8)]',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0]
    ],
    color: 'bg-red-500 border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)]',
  },
};

export const randomTetromino = () => {
  const tetrominoTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const randTetromino = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)] as keyof typeof TETROMINOES;
  return TETROMINOES[randTetromino];
};
