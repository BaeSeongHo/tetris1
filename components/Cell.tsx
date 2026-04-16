'use client';
import React from 'react';
import { TETROMINOES, TetrominoType } from '../utils/tetrominoes';

interface Props {
  type: TetrominoType;
}

const Cell: React.FC<Props> = ({ type }) => {
  const tType = TETROMINOES[type] ? type : 0;
  const colorPattern = TETROMINOES[tType].color;

  return (
    <div
      className={`w-full h-full border ${colorPattern} rounded-sm transition-all duration-100 ease-in-out`}
    />
  );
};

export default React.memo(Cell);
