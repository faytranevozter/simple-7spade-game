'use client';

import React from 'react';
import { Player, calculateScore } from './gameLogic';

interface PlayerPanelProps {
  player: Player;
  isCurrentTurn: boolean;
  isAnimating: boolean;
  penaltyFlash: boolean;
  aceMode: 'low' | 'high' | null;
  orientation: 'left' | 'top' | 'right';
}

const PLAYER_COLORS: Record<string, string> = {
  'player-1': 'bg-purple-500',
  'player-2': 'bg-blue-500',
  'player-3': 'bg-rose-500',
};

const PLAYER_RING: Record<string, string> = {
  'player-1': 'ring-purple-400',
  'player-2': 'ring-blue-400',
  'player-3': 'ring-rose-400',
};

export default function PlayerPanel({
  player,
  isCurrentTurn,
  isAnimating,
  penaltyFlash,
  aceMode,
  orientation,
}: PlayerPanelProps) {
  const score = calculateScore(player, aceMode);
  const dotColor = PLAYER_COLORS[player.id] ?? 'bg-gray-400';
  const ringColor = PLAYER_RING[player.id] ?? 'ring-gray-400';

  const isHorizontal = orientation === 'top';

  return (
    <div
      className={`
        rounded-xl border p-2 transition-all duration-200
        ${isCurrentTurn
          ? `bg-black/40 border-white/30 ring-2 ${ringColor}`
          : 'bg-black/20 border-white/10'
        }
        ${isHorizontal ? 'flex flex-row items-center gap-3' : 'flex flex-col items-center gap-2'}
        ${isHorizontal ? 'min-w-[280px]' : 'w-[90px]'}
      `}
    >
      {/* Avatar + name */}
      <div className={`flex items-center gap-2 ${isHorizontal ? '' : 'flex-col'}`}>
        <div className={`relative w-8 h-8 rounded-full ${dotColor} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-sm">{player.name[0]}</span>
          {isCurrentTurn && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border border-[#1a4a2e]" />
          )}
        </div>
        <div className={isHorizontal ? '' : 'text-center'}>
          <div className="text-white/80 text-xs font-semibold leading-none">{player.name}</div>
          {isCurrentTurn && (
            <div className="text-amber-400 text-xs mt-0.5">
              {isAnimating ? 'thinking…' : 'playing'}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={`flex ${isHorizontal ? 'flex-row gap-4' : 'flex-col gap-1'} items-center`}>
        {/* Cards in hand */}
        <div className="flex items-center gap-1.5">
          <FaceDownCardStack count={player.hand.length} isHorizontal={isHorizontal} />
          <div className="text-center">
            <div className="text-white/60 text-xs tabular-nums font-semibold leading-none">{player.hand.length}</div>
            <div className="text-white/30 text-xs leading-none">cards</div>
          </div>
        </div>

        {/* Penalties */}
        <div className={`flex items-center gap-1.5 ${penaltyFlash ? 'animate-penalty' : ''}`}>
          <div className="w-4 h-5 rounded-sm bg-red-900/60 border border-red-500/40 flex items-center justify-center">
            <span className="text-red-400 text-xs">↓</span>
          </div>
          <div className="text-center">
            <div className={`text-xs tabular-nums font-bold leading-none ${player.penalties.length > 0 ? 'text-red-400' : 'text-white/40'}`}>
              {player.penalties.length}
            </div>
            <div className="text-white/30 text-xs leading-none">pen.</div>
          </div>
        </div>

        {/* Score */}
        {aceMode !== null || player.penalties.length > 0 ? (
          <div className="text-center">
            <div className={`text-xs tabular-nums font-bold leading-none ${score > 0 ? 'text-orange-400' : 'text-white/40'}`}>
              {score}
            </div>
            <div className="text-white/30 text-xs leading-none">pts</div>
          </div>
        ) : null}
      </div>

      {/* AI thinking dots */}
      {isAnimating && (
        <div className="flex gap-1 items-center justify-center">
          {[0, 1, 2].map(i => (
            <span
              key={`thinking-dot-${player.id}-${i}`}
              className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FaceDownCardStack({ count, isHorizontal }: { count: number; isHorizontal: boolean }) {
  const displayCount = Math.min(count, 5);
  return (
    <div className="relative" style={{ width: 20 + displayCount * 2, height: 26 }}>
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={`stack-card-${i}`}
          className="absolute rounded-sm bg-[#1a3a5c] border border-[#2a5080]"
          style={{
            width: 18,
            height: 24,
            left: i * 2,
            top: 0,
            zIndex: i,
          }}
        />
      ))}
    </div>
  );
}