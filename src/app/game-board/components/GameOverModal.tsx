'use client';

import React from 'react';
import { Player, calculateScore, SUIT_SYMBOLS, rankLabel } from './gameLogic';

interface GameOverModalProps {
  players: Player[];
  winner: Player | null;
  aceMode: 'low' | 'high' | null;
  onNewGame: () => void;
}

const PLAYER_COLORS: Record<string, string> = {
  'player-0': 'bg-amber-500',
  'player-1': 'bg-purple-500',
  'player-2': 'bg-blue-500',
  'player-3': 'bg-rose-500',
};

const PLAYER_TEXT: Record<string, string> = {
  'player-0': 'text-amber-400',
  'player-1': 'text-purple-400',
  'player-2': 'text-blue-400',
  'player-3': 'text-rose-400',
};

export default function GameOverModal({ players, winner, aceMode, onNewGame }: GameOverModalProps) {
  const scores = players
    .map(p => ({ player: p, score: calculateScore(p, aceMode) }))
    .sort((a, b) => a.score - b.score);

  const isHumanWinner = winner?.isHuman;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="animate-slide-in-modal bg-[#0f2318] border border-[#2a6040] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{isHumanWinner ? '🏆' : '🃏'}</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isHumanWinner ? 'You Win!' : `${winner?.name} Wins!`}
          </h2>
          <p className="text-white/40 text-sm">
            {isHumanWinner
              ? 'Well played — fewest penalty points!'
              : `${winner?.name} had the fewest penalty points`
            }
          </p>
        </div>

        {/* Scores */}
        <div className="space-y-2 mb-6">
          {scores.map((entry, rank) => {
            const { player, score } = entry;
            const isWinner = player.id === winner?.id;
            const dotColor = PLAYER_COLORS[player.id] ?? 'bg-gray-400';
            const textColor = PLAYER_TEXT[player.id] ?? 'text-white';

            return (
              <div
                key={`result-${player.id}`}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 border
                  ${isWinner
                    ? 'bg-amber-500/10 border-amber-500/30' :'bg-white/5 border-white/10'
                  }
                `}
              >
                {/* Rank */}
                <span className={`text-sm font-bold tabular-nums w-5 text-center ${isWinner ? 'text-amber-400' : 'text-white/30'}`}>
                  {rank + 1}
                </span>

                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full ${dotColor} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-xs">{player.name[0]}</span>
                </div>

                {/* Name */}
                <span className={`flex-1 font-semibold text-sm ${isWinner ? 'text-white' : 'text-white/70'}`}>
                  {player.isHuman ? 'You' : player.name}
                  {isWinner && <span className="ml-2 text-amber-400 text-xs">Winner</span>}
                </span>

                {/* Score */}
                <div className="text-right">
                  <div className={`font-bold text-sm tabular-nums ${score === 0 ? 'text-green-400' : score > 20 ? 'text-red-400' : 'text-orange-400'}`}>
                    {score} pts
                  </div>
                  <div className="text-white/30 text-xs">
                    {player.penalties.length} pen.
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Penalty breakdown for human */}
        {players[0].penalties.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3 mb-4">
            <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Your Penalty Cards</div>
            <div className="flex flex-wrap gap-1">
              {players[0].penalties.map(card => (
                <div
                  key={`penalty-card-${card.id}`}
                  className="flex items-center gap-0.5 bg-black/30 rounded px-1.5 py-0.5"
                >
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: card.suit === 'hearts' || card.suit === 'diamonds' ? '#dc2626' : '#e2e8f0' }}
                  >
                    {rankLabel(card.rank)}{SUIT_SYMBOLS[card.suit]}
                  </span>
                  <span className="text-white/30 text-xs">
                    ={penaltyValue(card, aceMode)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onNewGame}
          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold py-3 rounded-xl transition-all duration-150 text-base"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function penaltyValue(card: { rank: number }, aceMode: 'low' | 'high' | null): number {
  if (card.rank === 1) return aceMode === 'high' ? 14 : 1;
  if (card.rank === 14) return 14;
  return card.rank;
}