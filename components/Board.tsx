'use client';
import React from 'react';
import Cell from './Cell';
import { StageType } from '../utils/gameHelpers';

interface Props {
  stage: StageType;
}

const Board: React.FC<Props> = ({ stage }) => {
  return (
    <div className="grid grid-rows-[repeat(20,minmax(0,1fr))] grid-cols-[repeat(10,minmax(0,1fr))] gap-[2px] w-full max-w-[400px] aspect-[1/2] p-[4px] bg-[#222] border-4 border-[#333] rounded-[10px] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      {stage.map(row => row.map((cell, x) => <Cell key={x} type={cell[0]} status={cell[1]} />))}
    </div>
  );
};

export default Board;
