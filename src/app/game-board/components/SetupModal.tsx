'use client';

import React from 'react';

interface SetupModalProps {
  onStart: () => void;
}

export default function SetupModal({ onStart }: SetupModalProps) {
  return (
    <div className="animate-slide-in-modal bg-[#0f2318] border border-[#2a6040] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">♠</div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">SevenSpade</h1>
        <p className="text-white/50 text-sm">A 4-player sequence card game</p>
      </div>

      {/* Rules */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-3">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">How to Play</h2>
        <RuleItem icon="🃏" text="13 cards are dealt to each of 4 players" />
        <RuleItem icon="♠" text="The player with 7♠ starts by placing it on the board" />
        <RuleItem icon="↕" text="Extend sequences up or down from 7 in each suit" />
        <RuleItem icon="7" text="Start a new suit by playing any 7" />
        <RuleItem icon="⬇" text="If no valid move, discard one card face-down (penalty)" />
        <RuleItem icon="🏆" text="Lowest total penalty points wins" />
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          { name: 'You', pos: '↓', color: 'bg-amber-500' },
          { name: 'Aria', pos: '←', color: 'bg-purple-500' },
          { name: 'Blake', pos: '↑', color: 'bg-blue-500' },
          { name: 'Cora', pos: '→', color: 'bg-rose-500' },
        ].map(p => (
          <div key={`setup-player-${p.name}`} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
            <span className={`w-2 h-2 rounded-full ${p.color}`} />
            <span className="text-white/80 text-sm font-medium">{p.name}</span>
            <span className="text-white/30 text-xs ml-auto">{p.pos}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold py-3 rounded-xl transition-all duration-150 text-base tracking-wide"
      >
        Deal Cards &amp; Start
      </button>
    </div>
  );
}

function RuleItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base leading-5 flex-shrink-0">{icon}</span>
      <span className="text-white/60 text-sm leading-5">{text}</span>
    </div>
  );
}