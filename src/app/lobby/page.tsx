'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Difficulty = 'easy' | 'normal' | 'hard';

interface PlayerConfig {
  name: string;
  isHuman: boolean;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'AI plays slowly & makes mistakes', color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400' },
  { value: 'normal', label: 'Normal', desc: 'Balanced challenge for most players', color: 'border-amber-500/60 bg-amber-500/10 text-amber-400' },
  { value: 'hard', label: 'Hard', desc: 'AI plays optimally with no mercy', color: 'border-rose-500/60 bg-rose-500/10 text-rose-400' },
];

const DEFAULT_AI_NAMES = ['Aria', 'Blake', 'Cora'];

export default function LobbyPage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { name: 'You', isHuman: true },
    { name: 'Aria', isHuman: false },
    { name: 'Blake', isHuman: false },
    { name: 'Cora', isHuman: false },
  ]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const updatePlayerName = (index: number, name: string) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name: name || (i === 0 ? 'You' : DEFAULT_AI_NAMES[i - 1]) } : p));
  };

  const handleStartGame = () => {
    const params = new URLSearchParams({
      difficulty,
      p0: players[0].name || 'You',
      p1: players[1].name || 'Aria',
      p2: players[2].name || 'Blake',
      p3: players[3].name || 'Cora',
      sound: soundEnabled ? '1' : '0',
      anim: animationsEnabled ? '1' : '0',
    });
    router.push(`/game-board?${params.toString()}`);
  };

  return (
    <div className="min-h-screen felt-texture flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/4 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-fade-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 drop-shadow-lg">♠</div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-1">SevenSpade</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">Card Game Lobby</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Player Names */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">Players</h2>
              <div className="space-y-3">
                {players.map((player, i) => {
                  const colors = ['bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-rose-500'];
                  const positions = ['↓ Bottom', '← Left', '↑ Top', '→ Right'];
                  return (
                    <div key={`player-${i}`} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[i]}`} />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={player.name}
                          onChange={e => updatePlayerName(i, e.target.value)}
                          maxLength={12}
                          placeholder={i === 0 ? 'Your name' : DEFAULT_AI_NAMES[i - 1]}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
                        />
                        {i !== 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 text-xs">AI</span>
                        )}
                      </div>
                      <span className="text-white/25 text-xs w-14 text-right flex-shrink-0">{positions[i]}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Settings */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">Quick Settings</h2>
              <div className="space-y-3">
                <ToggleSetting
                  label="Sound Effects"
                  icon="🔊"
                  enabled={soundEnabled}
                  onToggle={() => setSoundEnabled(v => !v)}
                />
                <ToggleSetting
                  label="Card Animations"
                  icon="✨"
                  enabled={animationsEnabled}
                  onToggle={() => setAnimationsEnabled(v => !v)}
                />
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Difficulty */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">AI Difficulty</h2>
              <div className="space-y-2">
                {DIFFICULTY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-150 text-left ${
                      difficulty === opt.value
                        ? opt.color + 'border-opacity-100' :'border-white/10 bg-white/3 text-white/50 hover:bg-white/8 hover:border-white/20'
                    }`}
                  >
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${difficulty === opt.value ? '' : 'text-white/60'}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                    </div>
                    {difficulty === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Rules Accordion */}
            <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowRules(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-white/70 hover:text-white/90 transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-widest">How to Play</span>
                <span className={`text-white/40 transition-transform duration-200 ${showRules ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {showRules && (
                <div className="px-5 pb-4 space-y-2 border-t border-white/5 pt-3">
                  {[
                    ['🃏', '13 cards dealt to each of 4 players'],
                    ['♠', 'Player with 7♠ starts the game'],
                    ['↕', 'Extend sequences up or down from 7'],
                    ['7', 'Start a new suit by playing any 7'],
                    ['⬇', 'No valid move? Discard one card (penalty)'],
                    ['🏆', 'Lowest penalty points wins'],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-start gap-3">
                      <span className="text-sm flex-shrink-0 leading-5">{icon}</span>
                      <span className="text-white/50 text-xs leading-5">{text}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-6">
          <button
            onClick={handleStartGame}
            className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold py-4 rounded-2xl transition-all duration-150 text-lg tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30"
          >
            Deal Cards &amp; Start Game
          </button>
          <p className="text-center text-white/25 text-xs mt-3">
            You vs 3 AI opponents · {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} difficulty
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, icon, enabled, onToggle }: {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-white/70 text-sm">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-amber-500' : 'bg-white/15'}`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
