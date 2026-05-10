'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Card, initGame, getValidMoves, isValidPlay, applyPlay, aiChooseCard, aiChoosePenalty, calculateScore, foldAllHands, SUIT_SYMBOLS, rankLabel,  } from './gameLogic';
import BoardSequences from './BoardSequences';
import PlayerHand from './PlayerHand';
import PlayerPanel from './PlayerPanel';
import TurnIndicator from './TurnIndicator';
import GameOverModal from './GameOverModal';
import SetupModal from './SetupModal';
import { useRouter } from 'next/navigation';

interface GameBoardClientProps {
  difficulty?: 'easy' | 'normal' | 'hard';
  playerNames?: string[];
}

/**
 * After a fold or play has been applied, check for:
 * 1. All-fold cycle → fold every remaining hand card as penalty
 * 2. All hands empty → game over
 */
function resolveState(state: GameState): GameState {
  let s = state;

  // All players folded consecutively → mass-fold all remaining hands
  if (s.consecutiveFolds >= s.players.length) {
    s = foldAllHands(s);
    s = { ...s, lastAction: s.lastAction + ' — all players folded! Remaining hands discarded.' };
  }

  // Check game over
  const allEmpty = s.players.every(p => p.hand.length === 0);
  if (allEmpty) {
    const scores = s.players.map(p => ({
      player: p,
      score: calculateScore(p, s.aceMode),
    }));
    const minScore = Math.min(...scores.map(sc => sc.score));
    const winner = scores.find(sc => sc.score === minScore)!.player;
    return { ...s, gameOver: true, winner };
  }

  return s;
}

export default function GameBoardClient({ difficulty = 'normal', playerNames = ['You', 'Aria', 'Blake', 'Cora'] }: GameBoardClientProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [animatingPlayer, setAnimatingPlayer] = useState<string | null>(null);
  const [lastPlayedCard, setLastPlayedCard] = useState<Card | null>(null);
  const [penaltyFlash, setPenaltyFlash] = useState<string | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAITimer = () => {
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  };

  // ─── AI Turn ──────────────────────────────────────────────────────────────
  const processAITurn = useCallback((state: GameState) => {
    const player = state.players[state.currentPlayerIndex];
    if (player.isHuman || state.gameOver) return;

    setIsAIThinking(true);
    setAnimatingPlayer(player.id);

    const delay = 900 + Math.floor(state.turnCount * 0.1 * 100);

    clearAITimer();
    aiTimerRef.current = setTimeout(() => {
      setGameState(prev => {
        if (!prev) return prev;
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        if (currentPlayer.isHuman || prev.gameOver) return prev;

        const cardToPlay = aiChooseCard(currentPlayer, prev.board, prev.aceMode);
        let newState = { ...prev };

        if (cardToPlay) {
          const { newBoard, newAceMode } = applyPlay(prev.board, cardToPlay, prev.aceMode);
          const updatedPlayers = prev.players.map(p => {
            if (p.id !== currentPlayer.id) return p;
            return { ...p, hand: p.hand.filter(c => c.id !== cardToPlay.id) };
          });
          newState = {
            ...prev,
            board: newBoard,
            aceMode: newAceMode,
            players: updatedPlayers,
            consecutiveFolds: 0,
            lastAction: `${currentPlayer.name} played ${rankLabel(cardToPlay.rank)}${SUIT_SYMBOLS[cardToPlay.suit]}`,
          };
          setLastPlayedCard(cardToPlay);
        } else {
          const penalty = aiChoosePenalty(currentPlayer);
          const updatedPlayers = prev.players.map(p => {
            if (p.id !== currentPlayer.id) return p;
            return {
              ...p,
              hand: p.hand.filter(c => c.id !== penalty.id),
              penalties: [...p.penalties, penalty],
            };
          });
          setPenaltyFlash(currentPlayer.id);
          setTimeout(() => setPenaltyFlash(null), 600);
          newState = {
            ...prev,
            players: updatedPlayers,
            consecutiveFolds: prev.consecutiveFolds + 1,
            lastAction: `${currentPlayer.name} placed a card face-down (penalty)`,
          };
        }

        // Check game over / all-fold mass discard
        newState = resolveState(newState);

        // Advance turn
        if (!newState.gameOver) {
          newState = {
            ...newState,
            currentPlayerIndex: (newState.currentPlayerIndex + 1) % 4,
            turnCount: newState.turnCount + 1,
          };
        }

        return newState;
      });

      setIsAIThinking(false);
      setAnimatingPlayer(null);
    }, delay);
  }, []);

  // ─── Watch for AI turns ───────────────────────────────────────────────────
  useEffect(() => {
    if (!gameState || gameState.gameOver) return;
    const player = gameState.players[gameState.currentPlayerIndex];
    if (!player.isHuman) {
      processAITurn(gameState);
    }
    return () => clearAITimer();
  }, [gameState?.currentPlayerIndex, gameState?.gameOver]);

  // ─── Human play ───────────────────────────────────────────────────────────
  const handleCardClick = useCallback((card: Card) => {
    if (!gameState) return;
    const player = gameState.players[gameState.currentPlayerIndex];
    if (!player.isHuman || gameState.gameOver) return;

    if (!isValidPlay(card, gameState.board, gameState.aceMode)) {
      // Shake feedback — just re-select
      setSelectedCard(prev => prev?.id === card.id ? null : card);
      return;
    }

    setSelectedCard(card);
    setTimeout(() => {
      setGameState(prev => {
        if (!prev) return prev;
        const { newBoard, newAceMode } = applyPlay(prev.board, card, prev.aceMode);
        const updatedPlayers = prev.players.map(p => {
          if (!p.isHuman) return p;
          return { ...p, hand: p.hand.filter(c => c.id !== card.id) };
        });

        let newState: GameState = {
          ...prev,
          board: newBoard,
          aceMode: newAceMode,
          players: updatedPlayers,
          consecutiveFolds: 0,
          lastAction: `You played ${rankLabel(card.rank)}${SUIT_SYMBOLS[card.suit]}`,
          currentPlayerIndex: (prev.currentPlayerIndex + 1) % 4,
          turnCount: prev.turnCount + 1,
        };

        const allEmpty = newState.players.every(p => p.hand.length === 0);
        if (allEmpty) {
          const scores = newState.players.map(p => ({
            player: p,
            score: calculateScore(p, newState.aceMode),
          }));
          const minScore = Math.min(...scores.map(s => s.score));
          const winner = scores.find(s => s.score === minScore)!.player;
          newState = { ...newState, gameOver: true, winner, currentPlayerIndex: prev.currentPlayerIndex };
        }

        return newState;
      });
      setSelectedCard(null);
      setLastPlayedCard(card);
    }, 200);
  }, [gameState]);

  // ─── Human penalty ────────────────────────────────────────────────────────
  const handlePenaltyDiscard = useCallback(() => {
    if (!gameState) return;
    const player = gameState.players[gameState.currentPlayerIndex];
    if (!player.isHuman || gameState.gameOver) return;

    const validMoves = getValidMoves(player, gameState.board, gameState.aceMode);
    if (validMoves.length > 0) return; // Can't discard if valid moves exist

    if (!selectedCard) return;

    setPenaltyFlash(player.id);
    setTimeout(() => setPenaltyFlash(null), 600);

    setGameState(prev => {
      if (!prev) return prev;
      const updatedPlayers = prev.players.map(p => {
        if (!p.isHuman) return p;
        return {
          ...p,
          hand: p.hand.filter(c => c.id !== selectedCard.id),
          penalties: [...p.penalties, selectedCard],
        };
      });

      let newState: GameState = {
        ...prev,
        players: updatedPlayers,
        consecutiveFolds: prev.consecutiveFolds + 1,
        lastAction: `You placed a card face-down (penalty)`,
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % 4,
        turnCount: prev.turnCount + 1,
      };

      newState = resolveState(newState);
      if (newState.gameOver) {
        newState = { ...newState, currentPlayerIndex: prev.currentPlayerIndex };
      }

      return newState;
    });
    setSelectedCard(null);
  }, [gameState, selectedCard]);

  const handleNewGame = () => {
    clearAITimer();
    router.push('/lobby');
  };

  const handleStartGame = () => {
    const state = initGame();
    setGameState(state);
    setShowSetup(false);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen felt-texture flex items-center justify-center">
        <SetupModal onStart={handleStartGame} />
      </div>
    );
  }

  const humanPlayer = gameState.players[0];
  const leftPlayer = gameState.players[1];
  const topPlayer = gameState.players[2];
  const rightPlayer = gameState.players[3];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.isHuman && !gameState.gameOver;
  const humanValidMoves = isHumanTurn
    ? getValidMoves(humanPlayer, gameState.board, gameState.aceMode)
    : [];
  const canDiscard = isHumanTurn && humanValidMoves.length === 0 && selectedCard !== null;

  return (
    <div className="min-h-screen felt-texture flex flex-col select-none overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">♠</span>
          <span className="text-white font-bold text-lg tracking-tight">SevenSpade</span>
        </div>
        <TurnIndicator
          currentPlayer={currentPlayer}
          isAIThinking={isAIThinking}
          lastAction={gameState.lastAction}
          turnCount={gameState.turnCount}
        />
        <button
          onClick={handleNewGame}
          className="text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-3 py-1.5 transition-all duration-150 active:scale-95"
        >
          New Game
        </button>
      </div>

      {/* ── Main play area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-between px-4 py-2 gap-2 relative">

        {/* Top player */}
        <div className="w-full flex justify-center">
          <PlayerPanel
            player={topPlayer}
            isCurrentTurn={gameState.currentPlayerIndex === 2}
            isAnimating={animatingPlayer === topPlayer.id}
            penaltyFlash={penaltyFlash === topPlayer.id}
            aceMode={gameState.aceMode}
            orientation="top"
          />
        </div>

        {/* Middle row: left player + board + right player */}
        <div className="flex-1 w-full flex items-center justify-between gap-2 min-h-0">
          {/* Left player */}
          <div className="flex-shrink-0">
            <PlayerPanel
              player={leftPlayer}
              isCurrentTurn={gameState.currentPlayerIndex === 1}
              isAnimating={animatingPlayer === leftPlayer.id}
              penaltyFlash={penaltyFlash === leftPlayer.id}
              aceMode={gameState.aceMode}
              orientation="left"
            />
          </div>

          {/* Board */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <BoardSequences
              board={gameState.board}
              lastPlayedCard={lastPlayedCard}
              aceMode={gameState.aceMode}
            />
          </div>

          {/* Right player */}
          <div className="flex-shrink-0">
            <PlayerPanel
              player={rightPlayer}
              isCurrentTurn={gameState.currentPlayerIndex === 3}
              isAnimating={animatingPlayer === rightPlayer.id}
              penaltyFlash={penaltyFlash === rightPlayer.id}
              aceMode={gameState.aceMode}
              orientation="right"
            />
          </div>
        </div>

        {/* Human player hand */}
        <div className="w-full">
          <PlayerHand
            player={humanPlayer}
            isCurrentTurn={isHumanTurn}
            validMoves={humanValidMoves}
            selectedCard={selectedCard}
            onCardClick={handleCardClick}
            onSelectCard={setSelectedCard}
            canDiscard={canDiscard}
            onDiscard={handlePenaltyDiscard}
            penaltyFlash={penaltyFlash === humanPlayer.id}
            aceMode={gameState.aceMode}
          />
        </div>
      </div>

      {/* ── Game Over Modal ───────────────────────────────────────────────── */}
      {gameState.gameOver && (
        <GameOverModal
          players={gameState.players}
          winner={gameState.winner}
          aceMode={gameState.aceMode}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}