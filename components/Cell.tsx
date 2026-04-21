'use client';
import React from 'react';
import { TETROMINOES, TetrominoType } from '../utils/tetrominoes';

interface Props {
  type: TetrominoType;
  status: 'clear' | 'merged' | 'ghost';
}

const Cell: React.FC<Props> = ({ type, status }) => {
  const tType = TETROMINOES[type] ? type : 0;
  const colorPattern = status === 'ghost' ? 'border-zinc-700 bg-white/5 opacity-40' : TETROMINOES[tType].color;

  return (
    <div
      className={`w-full h-full border ${colorPattern} ${status === 'ghost' ? 'border-dashed' : ''} rounded-sm transition-all duration-100 ease-in-out`}
    />
  );
};

export default React.memo(Cell);
