'use client';

import React from 'react';
import { Player } from './gameLogic';

interface TurnIndicatorProps {
  currentPlayer: Player;
  isAIThinking: boolean;
  lastAction: string;
  turnCount: number;
}

const PLAYER_COLORS: Record<string, string> = {
  'player-0': 'text-amber-400',
  'player-1': 'text-purple-400',
  'player-2': 'text-blue-400',
  'player-3': 'text-rose-400',
};

export default function TurnIndicator({
  currentPlayer,
  isAIThinking,
  lastAction,
  turnCount,
}: TurnIndicatorProps) {
  const nameColor = PLAYER_COLORS[currentPlayer.id] ?? 'text-white';

  return (
    <div className="flex flex-col items-center gap-0.5 px-4">
      <div className="flex items-center gap-2">
        {isAIThinking && (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={`indicator-dot-${i}`}
                className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        )}
        <span className={`text-sm font-bold ${nameColor}`}>
          {currentPlayer.isHuman ? 'Your Turn' : `${currentPlayer.name}'s Turn`}
        </span>
        <span className="text-white/25 text-xs tabular-nums">#{turnCount + 1}</span>
      </div>
      <p className="text-white/40 text-xs max-w-xs text-center truncate">{lastAction}</p>
    </div>
  );
}