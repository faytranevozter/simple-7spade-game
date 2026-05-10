'use client';

import React from 'react';
import { BoardState, Suit, Card, SUIT_SYMBOLS, SUIT_COLORS, rankLabel } from './gameLogic';


interface BoardSequencesProps {
  board: BoardState;
  lastPlayedCard: Card | null;
  aceMode: 'low' | 'high' | null;
}

const SUITS_ORDER: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

const SUIT_NAMES: Record<Suit, string> = {
  spades: 'Spades',
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
};

export default function BoardSequences({ board, lastPlayedCard, aceMode }: BoardSequencesProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="space-y-2">
        {SUITS_ORDER.map(suit => {
          const seq = board[suit];
          const started = seq.low > 0;
          const symbol = SUIT_SYMBOLS[suit];
          const color = SUIT_COLORS[suit];

          // Build display range
          const displayCards: Array<{ rank: number; placed: boolean }> = [];

          if (started) {
            const lowDisplay = Math.max(1, seq.low - 0);
            const highDisplay = Math.min(14, seq.high + 0);
            for (let r = lowDisplay; r <= highDisplay; r++) {
              const placed = r >= seq.low && r <= seq.high;
              displayCards.push({ rank: r, placed });
            }
          }

          return (
            <div
              key={`board-suit-${suit}`}
              className={`
                flex items-center gap-2 rounded-xl px-3 py-2
                ${started ? 'bg-black/30' : 'bg-black/15'}
                border border-white/10
                transition-all duration-200
              `}
            >
              {/* Suit label */}
              <div className="flex-shrink-0 w-16 flex flex-col items-center">
                <span className="text-2xl leading-none" style={{ color: suit === 'hearts' || suit === 'diamonds' ? color : '#e2e8f0' }}>
                  {symbol}
                </span>
                <span className="text-white/30 text-xs mt-0.5">{SUIT_NAMES[suit]}</span>
                {seq.closed && (
                  <span className="text-amber-400 text-xs font-bold mt-0.5">CLOSED</span>
                )}
              </div>

              {/* Sequence */}
              <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide min-h-[52px] px-1">
                {!started ? (
                  <div className="flex items-center gap-2 text-white/20">
                    <div className="w-9 h-12 rounded-md border-2 border-dashed border-white/15 flex items-center justify-center">
                      <span className="text-xs">7</span>
                    </div>
                    <span className="text-xs">waiting for 7{symbol}</span>
                  </div>
                ) : (
                  displayCards.map(({ rank, placed }) => {
                    const isLast = lastPlayedCard?.suit === suit && lastPlayedCard?.rank === rank;
                    const card: Card = {
                      id: `board-${suit}-${rank}`,
                      suit,
                      rank: rank as any,
                    };

                    if (!placed) return null;

                    return (
                      <div key={`board-card-${suit}-${rank}`} className="flex-shrink-0">
                        <BoardCard
                          rank={rank}
                          suit={suit}
                          color={color}
                          symbol={symbol}
                          isCenter={rank === 7}
                          isLastPlayed={isLast}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sequence info */}
              {started && (
                <div className="flex-shrink-0 text-right">
                  <div className="text-white/40 text-xs tabular-nums">
                    {rankLabel(seq.low)}–{rankLabel(seq.high)}
                  </div>
                  <div className="text-white/25 text-xs">
                    {seq.high - seq.low + 1} cards
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ace mode indicator */}
      {aceMode && (
        <div className="mt-2 text-center text-xs text-amber-400/70 animate-fade-slide-up">
          Ace mode locked: {aceMode === 'low' ? 'Ace = 1 (low, before 2)' : 'Ace = 14 (high, after King)'}
        </div>
      )}
    </div>
  );
}

function BoardCard({
  rank,
  suit,
  color,
  symbol,
  isCenter,
  isLastPlayed,
}: {
  rank: number;
  suit: Suit;
  color: string;
  symbol: string;
  isCenter: boolean;
  isLastPlayed: boolean;
}) {
  const label = rankLabel(rank);
  const textColor = suit === 'hearts' || suit === 'diamonds' ? color : '#1e293b';

  return (
    <div
      className={`
        relative rounded-md border flex flex-col items-start justify-start
        font-bold tabular-nums flex-shrink-0
        transition-all duration-300
        ${isCenter ? 'border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.4)]' : 'border-gray-200'}
        ${isLastPlayed ? 'animate-deal border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.6)]' : ''}
        bg-white
      `}
      style={{ width: 32, height: 44, padding: '3px 4px', fontSize: 10 }}
    >
      <span style={{ color: textColor, lineHeight: 1, fontWeight: 700 }}>{label}</span>
      <span style={{ color: textColor, lineHeight: 1, fontSize: 12 }}>{symbol}</span>
    </div>
  );
}