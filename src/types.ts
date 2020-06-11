export enum Collections {
  users = 'users',
  requests = 'requests',
  games = 'games',
}

export type User = {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
};

export enum GameRequestStatus {
  pending = 'PENDING',
  declined = 'DECLINED',
}

export type GameRequest = {
  id: string;
  from: string;
  to: string;
  status: GameRequestStatus;
};

export enum GameStatus {
  ongoing = 'ONGOING',
  ended = 'ENDED',
}

export type Card = {
  suit: Suit;
  value: number;
};

export enum Phase {
  startPhase = 'START_PHASE',
  playPhase = 'PLAY_PHASE',
}

export type Turn = {
  player: string;
  phase: Phase;
  mustPlayCard: Card | null;
};

export type Round = {
  deck: Card[];
  discard: Card[];
  turn: Turn;
  playerCards: {
    [uid: string]: {
      hand: Card[];
      laid: { [index: number]: Card[] };
    };
  };
};

export type Game = {
  id: string;
  players: string[];
  rounds: Round[];
  status: GameStatus;
};

export enum Suit {
  spade = 'SPADE',
  diamond = 'DIAMOND',
  heart = 'HEART',
  club = 'CLUB',
}
