// ─── Types ────────────────────────────────────────────────────────────────────

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  hand: Card[];
  penalties: Card[];
  position: 'bottom' | 'left' | 'top' | 'right';
}

export interface SuitSequence {
  suit: Suit;
  low: number;   // lowest rank placed (starts at 7, goes down to 1 or 2)
  high: number;  // highest rank placed (starts at 7, goes up to 13 or 14)
  closed: boolean;
  cards: Card[];
}

export interface BoardState {
  spades: SuitSequence;
  hearts: SuitSequence;
  diamonds: SuitSequence;
  clubs: SuitSequence;
}

export interface GameState {
  players: Player[];
  board: BoardState;
  currentPlayerIndex: number;
  gameStarted: boolean;
  gameOver: boolean;
  aceMode: 'low' | 'high' | null; // set on first ace played
  turnCount: number;
  lastAction: string;
  winner: Player | null;
  consecutiveFolds: number; // resets to 0 on any play; when it reaches players.length all hands are folded
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_COLORS: Record<Suit, string> = {
  spades: '#1e293b',
  hearts: '#dc2626',
  diamonds: '#dc2626',
  clubs: '#1e293b',
};

export const RANK_LABELS: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};

export function rankLabel(rank: number): string {
  return RANK_LABELS[rank] ?? String(rank);
}

// ─── Deck ─────────────────────────────────────────────────────────────────────

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `${suit}-${rank}`, suit, rank: rank as Rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

export function dealCards(deck: Card[]): Card[][] {
  const hands: Card[][] = [[], [], [], []];
  deck.forEach((card, i) => hands[i % 4].push(card));
  return hands;
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function createInitialBoard(): BoardState {
  const makeSeq = (suit: Suit): SuitSequence => ({
    suit,
    low: 0,
    high: 0,
    closed: false,
    cards: [],
  });
  return {
    spades: makeSeq('spades'),
    hearts: makeSeq('hearts'),
    diamonds: makeSeq('diamonds'),
    clubs: makeSeq('clubs'),
  };
}

export function isSevenOnBoard(board: BoardState, suit: Suit): boolean {
  return board[suit].low === 7 && board[suit].high === 7;
}

// ─── Ace mode helper ──────────────────────────────────────────────────────────

/**
 * Determine if a card is a valid play given current board state and ace mode.
 * Ace can be played as rank 1 (low, before 2) or rank 14 (high, after King).
 * Once the first ace is played, all subsequent aces follow the same mode.
 */
export function getValidMoves(player: Player, board: BoardState, aceMode: 'low' | 'high' | null): Card[] {
  const valid: Card[] = [];
  for (const card of player.hand) {
    if (isValidPlay(card, board, aceMode)) {
      valid.push(card);
    }
  }
  return valid;
}

export function isValidPlay(card: Card, board: BoardState, aceMode: 'low' | 'high' | null): boolean {
  const seq = board[card.suit];
  let rank = card.rank;

  // Can always play a 7 if no 7 exists yet for that suit
  if (rank === 7 && seq.low === 0) return true;

  // Sequence not started for this suit
  if (seq.low === 0) return false;

  // Ace handling — Ace (rank 1) can close low (before 2) or high (after King)
  if (rank === 1) {
    if (seq.closed) return false;
    if ((aceMode === null || aceMode === 'low') && seq.low === 2) return true;
    if ((aceMode === null || aceMode === 'high') && seq.high === 13) return true;
    return false;
  }

  // Normal cards: can extend low (rank === seq.low - 1) or high (rank === seq.high + 1)
  if (!seq.closed) {
    if (rank === seq.low - 1) return true;
    if (rank === seq.high + 1) return true;
  }

  return false;
}

export function applyPlay(board: BoardState, card: Card, aceMode: 'low' | 'high' | null): { newBoard: BoardState; newAceMode: 'low' | 'high' | null } {
  const newBoard: BoardState = {
    spades: { ...board.spades, cards: [...board.spades.cards] },
    hearts: { ...board.hearts, cards: [...board.hearts.cards] },
    diamonds: { ...board.diamonds, cards: [...board.diamonds.cards] },
    clubs: { ...board.clubs, cards: [...board.clubs.cards] },
  };

  const seq = { ...newBoard[card.suit] };
  let newAceMode = aceMode;

  if (card.rank === 7) {
    seq.low = 7;
    seq.high = 7;
    seq.cards.push(card);
  } else if (card.rank === 1) {
    // Ace can close high (after King) or low (before 2).
    // Close high when aceMode is 'high', or when aceMode is null and only the high end is ready.
    const willCloseHigh =
      aceMode === 'high' ||
      (aceMode === null && seq.high === 13 && seq.low !== 2);
    if (willCloseHigh) {
      seq.high = 14; // Ace occupies position 14 in the high-close sequence
      seq.cards.push(card);
      seq.closed = true;
      newAceMode = 'high';
    } else {
      seq.low = 1;
      seq.cards.unshift(card);
      seq.closed = true;
      newAceMode = 'low';
    }
  } else if (card.rank === seq.low - 1) {
    seq.low = card.rank;
    seq.cards.unshift(card);
    // Check if ace low closes
    if (card.rank === 2 && aceMode === 'low') {
      // ace can now be played — not closed yet, just low extended to 2
    }
  } else if (card.rank === seq.high + 1) {
    seq.high = card.rank;
    seq.cards.push(card);
  }

  newBoard[card.suit] = seq;
  return { newBoard, newAceMode };
}

export function penaltyValue(card: Card, aceMode: 'low' | 'high' | null): number {
  if (card.rank === 1) return aceMode === 'high' ? 14 : 1;
  if (card.rank === 14) return 14;
  if (card.rank >= 11) return card.rank; // J=11, Q=12, K=13
  return card.rank;
}

/** Move every card remaining in every player's hand to their penalty pile. */
export function foldAllHands(state: GameState): GameState {
  const players = state.players.map(p => ({
    ...p,
    penalties: [...p.penalties, ...p.hand],
    hand: [],
  }));
  return { ...state, players };
}

export function calculateScore(player: Player, aceMode: 'low' | 'high' | null): number {
  return player.penalties.reduce((sum, c) => sum + penaltyValue(c, aceMode), 0);
}

// ─── AI logic ─────────────────────────────────────────────────────────────────

export function aiChooseCard(player: Player, board: BoardState, aceMode: 'low' | 'high' | null): Card | null {
  const valid = getValidMoves(player, board, aceMode);
  if (valid.length === 0) return null;

  // Prefer playing 7s first (opens new suit), then prefer cards that don't block sequences
  const sevens = valid.filter(c => c.rank === 7);
  if (sevens.length > 0) return sevens[0];

  // Prefer high-penalty cards (face cards, aces) to get rid of them
  const sorted = [...valid].sort((a, b) => penaltyValue(b, aceMode) - penaltyValue(a, aceMode));
  return sorted[0];
}

export function aiChoosePenalty(player: Player): Card {
  // Choose card with highest penalty value to discard (try to keep low-value cards)
  // Actually strategy: keep 7s, discard high penalty cards
  const sorted = [...player.hand].sort((a, b) => {
    // Never discard a 7 if possible
    if (a.rank === 7) return 1;
    if (b.rank === 7) return -1;
    return penaltyValue(b, null) - penaltyValue(a, null);
  });
  return sorted[0];
}

// ─── Game init ────────────────────────────────────────────────────────────────

export function initGame(): GameState {
  const deck = shuffleDeck(createDeck());
  const hands = dealCards(deck);

  const playerNames = ['You', 'Aria', 'Blake', 'Cora'];
  const positions: Array<'bottom' | 'left' | 'top' | 'right'> = ['bottom', 'left', 'top', 'right'];

  const players: Player[] = playerNames.map((name, i) => ({
    id: `player-${i}`,
    name,
    isHuman: i === 0,
    hand: hands[i].sort((a, b) => {
      if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      return a.rank - b.rank;
    }),
    penalties: [],
    position: positions[i],
  }));

  // Find who has 7 of spades
  let startingPlayerIndex = 0;
  for (let i = 0; i < players.length; i++) {
    if (players[i].hand.some(c => c.suit === 'spades' && c.rank === 7)) {
      startingPlayerIndex = i;
      break;
    }
  }

  const board = createInitialBoard();

  return {
    players,
    board,
    currentPlayerIndex: startingPlayerIndex,
    gameStarted: true,
    gameOver: false,
    aceMode: null,
    turnCount: 0,
    consecutiveFolds: 0,
    lastAction: `${players[startingPlayerIndex].name} holds 7♠ and goes first`,
    winner: null,
  };
}