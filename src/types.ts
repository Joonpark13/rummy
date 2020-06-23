export enum Collections {
  users = 'users',
  requests = 'requests',
  games = 'games',
  rounds = 'rounds',
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

export type MatchSet = Array<{ owner: string; card: Card }>;

export type Table = {
  [index: number]: MatchSet;
};

export type Round = {
  id: string;
  deck: Card[];
  discard: Card[];
  turn: Turn;
  table: Table;
  playerCards: {
    [uid: string]: {
      hand: Card[];
    };
  };
  startTime: firebase.firestore.Timestamp;
};

export type Game = {
  id: string;
  players: string[];
  rounds: string[];
  status: GameStatus;
  startTime: firebase.firestore.Timestamp;
};

export enum Suit {
  spade = 'SPADE',
  diamond = 'DIAMOND',
  heart = 'HEART',
  club = 'CLUB',
}
