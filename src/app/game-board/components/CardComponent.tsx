'use client';

import React from 'react';
import { Card, SUIT_SYMBOLS, SUIT_COLORS, rankLabel } from './gameLogic';

interface CardComponentProps {
  card: Card;
  isPlayable?: boolean;
  isSelected?: boolean;
  isFaceDown?: boolean;
  isSmall?: boolean;
  isTiny?: boolean;
  onClick?: (card: Card) => void;
  animateIn?: boolean;
  isLastPlayed?: boolean;
}

export default function CardComponent({
  card,
  isPlayable = false,
  isSelected = false,
  isFaceDown = false,
  isSmall = false,
  isTiny = false,
  onClick,
  animateIn = false,
  isLastPlayed = false,
}: CardComponentProps) {
  const suitColor = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const label = rankLabel(card.rank);

  if (isTiny) {
    return (
      <div
        className={`
          rounded border flex items-center justify-center font-bold tabular-nums
          ${isFaceDown
            ? 'bg-[#1a3a5c] border-[#2a5080]'
            : 'bg-white border-gray-200'
          }
        `}
        style={{ width: 22, height: 30, fontSize: 9 }}
      >
        {!isFaceDown && (
          <span style={{ color: suitColor, lineHeight: 1 }}>
            {label}{symbol}
          </span>
        )}
      </div>
    );
  }

  if (isSmall) {
    return (
      <div
        onClick={onClick ? () => onClick(card) : undefined}
        className={`
          rounded-md border flex flex-col items-start justify-start p-1 font-bold tabular-nums
          transition-all duration-150 flex-shrink-0
          ${isFaceDown
            ? 'bg-[#1a3a5c] border-[#2a5080]'
            : 'bg-white border-gray-200'
          }
          ${onClick ? 'cursor-pointer hover:scale-105' : ''}
          ${isLastPlayed ? 'ring-2 ring-amber-400' : ''}
        `}
        style={{ width: 36, height: 50, fontSize: 11 }}
      >
        {!isFaceDown && (
          <>
            <span style={{ color: suitColor, lineHeight: 1 }}>{label}</span>
            <span style={{ color: suitColor, lineHeight: 1, fontSize: 13 }}>{symbol}</span>
          </>
        )}
      </div>
    );
  }

  // Full size card (human hand)
  return (
    <div
      onClick={onClick ? () => onClick(card) : undefined}
      className={`
        relative rounded-lg border-2 flex flex-col items-start justify-start
        font-bold tabular-nums select-none
        transition-all duration-150
        ${animateIn ? 'animate-deal' : ''}
        ${isFaceDown
          ? 'bg-[#1a3a5c] border-[#2a5080] cursor-default'
          : 'bg-white border-gray-100'
        }
        ${onClick && !isFaceDown ? 'cursor-pointer card-hover' : ''}
        ${isSelected
          ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.5)] -translate-y-3'
          : ''
        }
        ${isPlayable && !isSelected
          ? 'border-amber-400/60 shadow-[0_0_0_2px_rgba(251,191,36,0.3)]'
          : ''
        }
        ${isLastPlayed ? 'ring-2 ring-amber-400' : ''}
        card-shadow
      `}
      style={{ width: 56, height: 80, padding: '4px 5px' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(card); } : undefined}
      aria-label={isFaceDown ? 'Face-down card' : `${label} of ${card.suit}`}
    >
      {!isFaceDown && (
        <>
          <div style={{ color: suitColor, fontSize: 14, lineHeight: 1, fontWeight: 700 }}>
            {label}
          </div>
          <div style={{ color: suitColor, fontSize: 18, lineHeight: 1 }}>
            {symbol}
          </div>
          {/* Center symbol */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: suitColor, fontSize: 22, opacity: 0.15 }}
          >
            {symbol}
          </div>
          {/* Bottom rank (rotated) */}
          <div
            className="absolute bottom-1 right-1 rotate-180"
            style={{ color: suitColor, fontSize: 10, lineHeight: 1, fontWeight: 700 }}
          >
            {label}
          </div>
        </>
      )}
      {isFaceDown && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-8 h-8 border-2 border-white/40 rounded-sm rotate-45" />
        </div>
      )}
      {/* Playable indicator dot — lives inside the card so it moves with hover transform */}
      {isPlayable && !isSelected && !isFaceDown && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#1a4a2e] z-10" />
      )}
    </div>
  );
}