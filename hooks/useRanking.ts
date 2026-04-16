import { useState, useEffect } from 'react';

export type RankEntry = {
  id: string;
  playerName: string;
  timeMs: number; // Lowest is better
  date: number;
};

export const useRanking = () => {
  const [rankings, setRankings] = useState<RankEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tetrisRankings');
      if (stored) {
        setRankings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load rankings:', e);
    }
  }, []);

  const addRank = (playerName: string, timeMs: number) => {
    const newEntry: RankEntry = {
      id: Math.random().toString(36).substring(2, 11),
      playerName,
      timeMs,
      date: Date.now(),
    };

    setRankings((prev) => {
      const newRankings = [...prev, newEntry].sort((a, b) => a.timeMs - b.timeMs);
      try {
        // Only store top 100 to avoid bloat
        localStorage.setItem('tetrisRankings', JSON.stringify(newRankings.slice(0, 100)));
      } catch (e) {
        console.error('Failed to save rankings:', e);
      }
      return newRankings;
    });
  };

  return { rankings, addRank };
};
