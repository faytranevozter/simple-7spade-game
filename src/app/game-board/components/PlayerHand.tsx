'use client';

import React from 'react';
import { Player, Card, SUIT_SYMBOLS, rankLabel, penaltyValue } from './gameLogic';
import CardComponent from './CardComponent';

interface PlayerHandProps {
  player: Player;
  isCurrentTurn: boolean;
  validMoves: Card[];
  selectedCard: Card | null;
  onCardClick: (card: Card) => void;
  onSelectCard: (card: Card | null) => void;
  canDiscard: boolean;
  onDiscard: () => void;
  penaltyFlash: boolean;
  aceMode: 'low' | 'high' | null;
}

export default function PlayerHand({
  player,
  isCurrentTurn,
  validMoves,
  selectedCard,
  onCardClick,
  onSelectCard,
  canDiscard,
  onDiscard,
  penaltyFlash,
  aceMode,
}: PlayerHandProps) {
  const validIds = new Set(validMoves.map(c => c.id));
  const hasValidMoves = validMoves.length > 0;
  const noMoves = isCurrentTurn && !hasValidMoves;

  return (
    <div className="w-full">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-white/70 text-sm font-semibold">Your Hand</span>
          <span className="text-white/30 text-xs">({player.hand.length} cards)</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Penalty pile indicator */}
          {player.penalties.length > 0 && (
            <div className={`flex items-center gap-1.5 ${penaltyFlash ? 'animate-penalty' : ''}`}>
              <div className="flex gap-0.5">
                {player.penalties.slice(-3).map((c, i) => (
                  <div
                    key={`penalty-preview-${c.id}`}
                    className="w-4 h-5 rounded-sm bg-[#1a3a5c] border border-[#2a5080]"
                  />
                ))}
              </div>
              <span className="text-red-400 text-xs font-bold tabular-nums">
                {player.penalties.length} penalty {player.penalties.length === 1 ? 'card' : 'cards'}
              </span>
            </div>
          )}

          {/* Turn status */}
          {isCurrentTurn && (
            <div className={`text-xs font-semibold px-2 py-1 rounded-md ${
              hasValidMoves
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {hasValidMoves
                ? `${validMoves.length} valid move${validMoves.length !== 1 ? 's' : ''}`
                : 'No valid moves — select a card to discard'
              }
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="bg-black/20 border border-white/10 rounded-xl p-3">
        {player.hand.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-white/30 text-sm">
            Hand empty
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {player.hand.map((card) => {
              const isPlayable = validIds.has(card.id);
              const isSelected = selectedCard?.id === card.id;

              return (
                <div
                  key={`hand-card-${card.id}`}
                  className="relative"
                >
                  <CardComponent
                    card={card}
                    isPlayable={isPlayable && isCurrentTurn}
                    isSelected={isSelected}
                    onClick={isCurrentTurn ? (c) => {
                      if (isPlayable) {
                        onCardClick(c);
                      } else {
                        // Select for potential penalty discard
                        onSelectCard(isSelected ? null : c);
                      }
                    } : undefined}
                    isFaceDown={false}
                  />
                  {/* Playable indicator dot */}
                  {isPlayable && isCurrentTurn && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#1a4a2e] z-10" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Discard action */}
        {noMoves && selectedCard && (
          <div className="mt-3 flex items-center justify-center gap-3 animate-fade-slide-up">
            <div className="text-white/50 text-xs">
              Selected: <span className="text-white font-semibold">
                {rankLabel(selectedCard.rank)}{SUIT_SYMBOLS[selectedCard.suit]}
              </span>
              <span className="text-orange-400 ml-2">
                (penalty: {penaltyValue(selectedCard, aceMode)} pts)
              </span>
            </div>
            <button
              onClick={onDiscard}
              className="bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all duration-150 border border-red-400/30"
            >
              Place Face-Down
            </button>
          </div>
        )}

        {/* No moves, no selection hint */}
        {noMoves && !selectedCard && (
          <div className="mt-2 text-center text-white/40 text-xs animate-fade-slide-up">
            Select any card from your hand to discard it face-down as a penalty
          </div>
        )}
      </div>
    </div>
  );
}