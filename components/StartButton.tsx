'use client';
import React from 'react';

interface Props {
  callback: () => void;
  gameOver: boolean;
}

const StartButton: React.FC<Props> = ({ callback, gameOver }) => {
  return (
    <button
      onClick={callback}
      className={`box-border mb-5 py-4 px-6 min-h-[50px] w-full max-w-[200px] rounded-[10px] border-none text-white text-lg font-bold uppercase cursor-pointer hover:opacity-90 transition-opacity drop-shadow-md ${gameOver ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-pink-600 hover:bg-pink-500'}`}
    >
      {gameOver ? 'Restart Game' : 'Start Game'}
    </button>
  );
};

export default StartButton;
