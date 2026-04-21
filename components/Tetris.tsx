'use client';
import React, { useState, useEffect } from 'react';
import { createStage, checkCollision } from '../utils/gameHelpers';
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useBoard } from '../hooks/useBoard';
import { useGameStatus } from '../hooks/useGameStatus';
import { useRanking } from '../hooks/useRanking';

import Board from './Board';
import Display from './Display';

// Use the URL from environment variables
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

const Tetris: React.FC = () => {
  // Global App States
  const [appMode, setAppMode] = useState<'MENU' | 'PLAYING'>('MENU');
  const [playerName, setPlayerName] = useState('');
  
  // Ref to hold root div for focus
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Game Action States
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  
  // Timer states
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const { player, updatePlayerPos, resetPlayer, playerRotate } = usePlayer();
  const [stage, setStage, rowsCleared] = useBoard(player, resetPlayer);
  const { score, setScore, rows, setRows, level, setLevel } = useGameStatus(rowsCleared);
  const { rankings, addRank } = useRanking();

  const formatFinishTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const submitToGoogleSheet = async (name: string, timeMs: number) => {
    if (!GOOGLE_SCRIPT_URL) {
      console.warn('Google Script URL not found in environment variables. Data not sent to Sheet.');
      return;
    }

    try {
      const finishtime = formatFinishTime(timeMs);
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Essential for Google Apps Script Web App requests from browser
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, finishtime }),
      });
      console.log('Successfully submitted to Google Sheets');
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
    }
  };

  // Win condition check
  useEffect(() => {
    if (appMode === 'PLAYING' && rows >= 3 && !gameOver) {
      setGameOver(true);
      setDropTime(null);
      // Save rank if won
      if (startTime !== null) {
        const finalTime = Date.now() - startTime;
        setElapsedTime(finalTime); // Ensure final exact tick
        addRank(playerName || 'Anonymous', finalTime);
        submitToGoogleSheet(playerName || 'Anonymous', finalTime);
      }
    }
  }, [rows, gameOver, appMode, startTime, playerName, addRank]);

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime !== null && !gameOver && appMode === 'PLAYING') {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [startTime, gameOver, appMode]);

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const startGame = () => {
    if (!playerName.trim()) return;

    setAppMode('PLAYING');
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    
    // Ensure the wrapper regains focus so keyboard inputs work instantly
    setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.focus();
      }
    }, 100);
  };

  const returnToMenu = () => {
    setAppMode('MENU');
    setGameOver(false);
    setStage(createStage());
  };

  const drop = () => {
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      // Game over condition (hit ceiling)
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver && appMode === 'PLAYING') {
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const move = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gameOver && appMode === 'PLAYING' && startTime !== null) {
      if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }

      const { keyCode } = e;
      if (keyCode === 37) {
        movePlayer(-1);
      } else if (keyCode === 39) {
        movePlayer(1);
      } else if (keyCode === 40) {
        dropPlayer();
      } else if (keyCode === 38) {
        playerRotate(stage, 1);
      } else if (keyCode === 32) {
        let offset = 1;
        while (!checkCollision(player, stage, { x: 0, y: offset })) {
           offset += 1;
        }
        updatePlayerPos({ x: 0, y: offset - 1, collided: true });
        
        setDropTime(null);
        setTimeout(() => {
          if (!gameOver) setDropTime(1000 / (level + 1) + 200);
        }, 100);
      }
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  const formattedTime = (elapsedTime / 1000).toFixed(2);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full min-h-screen overflow-hidden outline-none bg-gradient-to-br from-zinc-900 to-black text-zinc-100 flex items-center justify-center p-4 font-sans focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={move}
      onKeyUp={keyUp}
    >
      
      {/* MENU OVERLAY */}
      {appMode === 'MENU' && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            
            <div className="text-center">
              <h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-lg">
                TETRIS DASH
              </h1>
              <p className="text-zinc-400">Clear 3 rows as fast as you can!</p>
            </div>

            <div className="bg-[#111] p-6 rounded-[20px] border border-zinc-800 shadow-2xl">
              <label className="block text-sm font-bold text-zinc-300 mb-2 uppercase tracking-widest">
                Player Name
              </label>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={12}
                className="w-full bg-black border-2 border-zinc-700 rounded-lg p-4 text-white font-bold text-xl outline-none focus:border-pink-500 transition-colors placeholder-zinc-700 mb-6"
              />
              
              <button
                onClick={startGame}
                disabled={!playerName.trim()}
                className="w-full bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-500 hover:-translate-y-1 transform transition-all text-white font-bold py-4 rounded-lg text-xl tracking-widest uppercase shadow-[0_0_15px_rgba(219,39,119,0.4)]"
              >
                Start Game
              </button>
            </div>

            <div className="bg-[#111] p-6 rounded-[20px] border border-zinc-800 shadow-2xl flex-1">
              <h3 className="text-lg font-bold text-zinc-300 mb-4 flex items-center justify-between uppercase tracking-widest border-b border-zinc-800 pb-2">
                🏆 Top Rankings
              </h3>
              
              {rankings.length === 0 ? (
                <div className="text-center py-6 text-zinc-600 font-mono text-sm">
                  No records yet. Be the first!
                </div>
              ) : (
                <ul className="space-y-3">
                  {rankings.slice(0, 5).map((rank, i) => (
                    <li key={rank.id} className="flex justify-between items-center bg-zinc-900 rounded-md p-3 border border-zinc-800">
                      <div className="flex items-center gap-3">
                        <span className={`font-black text-lg ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                          #{i + 1}
                        </span>
                        <span className="font-bold text-white text-md max-w-[120px] truncate">{rank.playerName}</span>
                      </div>
                      <span className="font-mono text-pink-400 font-bold bg-pink-950/30 px-2 py-1 rounded">
                        {(rank.timeMs / 1000).toFixed(2)}s
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {appMode === 'PLAYING' && gameOver && startTime !== null && (
        <div className="absolute inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center animate-in fade-in duration-500 text-center p-6">
          <h2 className={`text-6xl md:text-8xl font-black mb-4 ${rows >= 3 ? 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]' : 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]'}`}>
            {rows >= 3 ? "CLEARED!" : "GAME OVER"}
          </h2>
          <div className="mb-8">
            <p className="text-2xl text-zinc-300 mb-1 font-mono">
              Time: {formattedTime}s
            </p>
            <p className="text-lg text-zinc-400 font-mono">
              Rows Cleared: {rows} / 3
            </p>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 w-full max-w-sm mb-8 animate-in slide-in-from-bottom-5 duration-700 delay-200">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">
              🏆 Top 3 Rankings
            </h3>
            {rankings.length === 0 ? (
              <p className="text-zinc-600 py-2 text-sm italic">No records yet</p>
            ) : (
              <ul className="space-y-2">
                {rankings.slice(0, 3).map((rank, i) => (
                  <li key={rank.id} className="flex justify-between items-center bg-black/40 rounded-lg px-3 py-2 border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : 'text-amber-600'}`}>
                        #{i + 1}
                      </span>
                      <span className="font-bold text-white text-sm truncate max-w-[100px]">{rank.playerName}</span>
                    </div>
                    <span className="font-mono text-pink-400 text-sm font-bold">
                      {(rank.timeMs / 1000).toFixed(2)}s
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex gap-4 flex-col sm:flex-row w-full max-w-sm">
            <button
              onClick={startGame}
              className="flex-1 bg-pink-600 hover:bg-pink-500 hover:scale-105 transform transition-all text-white font-bold py-4 rounded-[10px] text-lg tracking-widest uppercase shadow-[0_0_20px_rgba(219,39,119,0.5)] border-2 border-pink-400 border-opacity-50"
            >
              Play Again
            </button>
            <button
              onClick={returnToMenu}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 hover:scale-105 transform transition-all text-white font-bold py-4 rounded-[10px] text-lg tracking-widest uppercase border-2 border-zinc-600"
            >
              Menu
            </button>
          </div>
        </div>
      )}

      {/* GAME UI */}
      {appMode === 'PLAYING' && (
        <div className="flex flex-col md:flex-row items-center justify-center max-w-[900px] w-full mx-auto gap-12 relative z-10 transition-opacity duration-500">
          <div className="w-full flex-1 flex justify-center md:justify-end min-w-[300px]">
            <Board stage={stage} />
          </div>

          <aside className="w-full max-w-[250px] flex flex-col items-center md:items-start">
            <div className="mb-4 text-center md:text-left w-full">
               <h2 className="text-pink-500 font-black text-2xl tracking-widest uppercase truncate">{playerName}</h2>
            </div>
            <div className="w-full">
              <Display text={`Time:`} />
              <div className="mb-5 p-3 min-h-12 w-full rounded-[10px] border-4 border-[#333] bg-black text-pink-400 font-mono text-2xl text-center shadow-[0px_4px_10px_rgba(0,0,0,0.5)]">
                {formattedTime}s
              </div>
              <Display text={`Rows: ${rows} / 3`} />
              <Display text={`Score: ${score}`} />
            </div>

            <button
              onClick={returnToMenu}
              className={`box-border mt-4 py-4 px-6 min-h-[50px] w-full rounded-[10px] border-2 border-zinc-700 text-zinc-300 bg-zinc-900 text-sm font-bold uppercase cursor-pointer hover:bg-zinc-800 transition-colors drop-shadow-md`}
            >
              Back to Menu
            </button>

            <div className="mt-8 text-zinc-500 text-sm hidden md:block border-t border-zinc-800 pt-6 w-full">
              <h3 className="text-zinc-400 font-bold mb-3 uppercase tracking-wider text-xs">Controls</h3>
              <ul className="space-y-3">
                <li><span className="inline-block w-8 py-1 rounded-sm shadow-sm text-center bg-zinc-800 text-zinc-300">←</span> <span className="inline-block w-8 py-1 rounded-sm shadow-sm text-center bg-zinc-800 text-zinc-300">→</span> Move</li>
                <li><span className="inline-block w-8 py-1 rounded-sm shadow-sm text-center bg-zinc-800 text-zinc-300">↑</span> Rotate</li>
                <li><span className="inline-block w-8 py-1 rounded-sm shadow-sm text-center bg-zinc-800 text-zinc-300">↓</span> Soft Drop</li>
                <li><span className="inline-block px-3 py-1 rounded-sm shadow-sm text-center bg-zinc-800 text-zinc-300 font-mono text-xs uppercase">Space</span> Hard Drop</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Tetris;
