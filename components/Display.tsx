'use client';
import React from 'react';

interface Props {
  gameOver?: boolean;
  text: string;
}

const Display: React.FC<Props> = ({ gameOver, text }) => {
  return (
    <div
      className={`box-border flex items-center mb-5 p-5 min-h-12 w-full max-w-[200px] rounded-[10px] border-4 bg-black text-[#999] font-mono text-sm tracking-widest uppercase ${
        gameOver ? 'text-red-500 border-red-500' : 'border-[#333]'
      } shadow-[0px_4px_10px_rgba(0,0,0,0.5)]`}
    >
      {text}
    </div>
  );
};

export default Display;
