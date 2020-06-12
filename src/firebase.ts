import { useState, useEffect } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import shuffle from 'shuffle-array';
import { ORDERED_DECK, HAND_SIZE } from './constants';
import {
  Collections,
  User,
  GameRequestStatus,
  GameRequest,
  GameStatus,
  Game,
  Round,
  Card,
  Phase,
  Table,
  MatchSet,
} from './types';
import {
  getCurrentRound,
  isSameCard,
  isValidSet,
  calculateRoundScoreSums,
} from './util';

const firebaseConfig = {
  apiKey: 'AIzaSyCUX6oYXngvqjDR29JBam1LPa2FoaZmRA8',
  authDomain: 'rummy-500.firebaseapp.com',
  databaseURL: 'https://rummy-500.firebaseio.com',
  projectId: 'rummy-500',
  storageBucket: 'rummy-500.appspot.com',
  messagingSenderId: '119518676647',
  appId: '1:119518676647:web:df558bbe6e60b07dafbd82',
  measurementId: 'G-27YTQDMRCM',
};

firebase.initializeApp(firebaseConfig);

export default firebase;

const db = firebase.firestore();

export function useCurrentUser(): firebase.User | null {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      }),
    [setUser]
  );

  return user;
}

export function useIsSignedIn(): boolean {
  const user = useCurrentUser();
  return Boolean(user);
}

export async function userExists(uid: string): Promise<boolean> {
  const docRef = await db.collection(Collections.users).doc(uid).get();
  return docRef.exists;
}

function queryUserEmail(email: string) {
  return db.collection(Collections.users).where('email', '==', email).get();
}

export async function findUserByEmail(email: string): Promise<User> {
  const querySnapshot = await queryUserEmail(email);
  return querySnapshot.docs[0].data() as User;
}

export async function userEmailExists(email: string): Promise<boolean> {
  const querySnapshot = await queryUserEmail(email);
  return !querySnapshot.empty;
}

export function addUserToFirestore(user: firebase.User): void {
  const data = {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    uid: user.uid,
  };
  db.collection(Collections.users).doc(user.uid).set(data);
}

export function signOut(): void {
  firebase.auth().signOut();
}

export function createGameRequest(
  recipientUid: string,
  senderUid: string
): void {
  db.collection(Collections.requests).add({
    from: senderUid,
    to: recipientUid,
    status: GameRequestStatus.pending,
  });
}

function queryRequest(
  field: string,
  uid: string,
  setter: (value: GameRequest[]) => void
) {
  return db
    .collection(Collections.requests)
    .where(field, '==', uid)
    .onSnapshot((querySnapshot) => {
      setter(
        querySnapshot.docs.map(
          (queryDocSnapshot) =>
            ({
              id: queryDocSnapshot.id,
              ...queryDocSnapshot.data(),
            } as GameRequest)
        )
      );
    });
}

export function useGameRequests(): [GameRequest[], GameRequest[]] {
  const user = useCurrentUser();
  const [sentGameRequests, setSentGameRequests] = useState<GameRequest[]>([]);
  const [receivedGameRequests, setReceivedGameRequests] = useState<
    GameRequest[]
  >([]);

  useEffect(() => {
    if (user) {
      return queryRequest('from', user.uid, setSentGameRequests);
    }
  }, [setSentGameRequests, user]);

  useEffect(() => {
    if (user) {
      return queryRequest('to', user.uid, setReceivedGameRequests);
    }
  }, [setReceivedGameRequests, user]);

  return [sentGameRequests, receivedGameRequests];
}

export function useUser(uid: string | null): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      if (uid) {
        const doc = await db.collection(Collections.users).doc(uid).get();
        setUser(doc.data() as User);
      }
    })();
  }, [uid, setUser]);

  return user;
}

export async function pendingGameRequestExists(
  currentUid: string,
  recipientEmail: string
): Promise<boolean> {
  const { uid: recipientUid } = await findUserByEmail(recipientEmail);
  const querySnapshot = await db
    .collection(Collections.requests)
    .where('from', '==', currentUid)
    .where('to', '==', recipientUid)
    .get();
  return !querySnapshot.empty;
}

export function removeRequest(gameRequest: GameRequest): void {
  db.collection(Collections.requests).doc(gameRequest.id).delete();
}

function initializeRound(firstPlayerUid: string, secondPlayerUid: string) {
  const shuffledDeck = shuffle(ORDERED_DECK, { copy: true });
  return {
    playerCards: {
      [firstPlayerUid]: {
        hand: shuffledDeck.slice(0, HAND_SIZE),
      },
      [secondPlayerUid]: {
        hand: shuffledDeck.slice(HAND_SIZE, HAND_SIZE * 2),
      },
    },
    discard: [shuffledDeck[HAND_SIZE * 2]],
    deck: shuffledDeck.slice(HAND_SIZE * 2 + 1),
    turn: {
      player: firstPlayerUid,
      phase: Phase.startPhase,
      mustPlayCard: null,
    },
    table: {},
  };
}

export function createGame(gameRequest: GameRequest): void {
  removeRequest(gameRequest);
  db.collection(Collections.games).add({
    players: [gameRequest.from, gameRequest.to],
    rounds: [initializeRound(gameRequest.from, gameRequest.to)],
    status: GameStatus.ongoing,
    startTime: firebase.firestore.Timestamp.fromDate(new Date()),
  });
}

function useGames(status: GameStatus) {
  const [games, setGames] = useState<Game[]>([]);
  const user = useCurrentUser();

  useEffect(() => {
    if (user) {
      return db
        .collection(Collections.games)
        .where('players', 'array-contains', user.uid)
        .where('status', '==', status)
        .onSnapshot((querySnapshot) => {
          setGames(
            querySnapshot.docs.map(
              (queryDocSnapshot) =>
                ({
                  id: queryDocSnapshot.id,
                  ...queryDocSnapshot.data(),
                } as Game)
            )
          );
        });
    }
  }, [user, setGames, status]);

  return games;
}

export function useCurrentGames(): Game[] {
  return useGames(GameStatus.ongoing);
}

export function usePreviousGames(): Game[] {
  return useGames(GameStatus.ended);
}

function updateRound(game: Game, updatedRound: Round) {
  db.collection(Collections.games)
    .doc(game.id)
    .update({
      rounds: [...game.rounds.slice(0, game.rounds.length - 1), updatedRound],
    });
}

export async function drawCard(game: Game, currentUid: string) {
  const currentRound = getCurrentRound(game);
  const drawnCard = currentRound.deck[0];
  const updatedRound = {
    ...currentRound,
    deck: currentRound.deck.slice(1),
    playerCards: {
      ...currentRound.playerCards,
      [currentUid]: {
        ...currentRound.playerCards[currentUid],
        hand: [...currentRound.playerCards[currentUid].hand, drawnCard],
      },
    },
    turn: {
      ...currentRound.turn,
      phase: Phase.playPhase,
    },
  };
  updateRound(game, updatedRound);
}

export function pickUpDiscards(
  selectedCardIndex: number,
  game: Game,
  currentUid: string
): void {
  const currentRound = getCurrentRound(game);
  const cardsPickedUp = currentRound.discard.slice(selectedCardIndex);
  const mustPlayCard = cardsPickedUp.length === 1 ? null : cardsPickedUp[0];
  const updatedRound = {
    ...currentRound,
    discard: currentRound.discard.slice(0, selectedCardIndex),
    playerCards: {
      ...currentRound.playerCards,
      [currentUid]: {
        ...currentRound.playerCards[currentUid],
        hand: [...currentRound.playerCards[currentUid].hand, ...cardsPickedUp],
      },
    },
    turn: {
      ...currentRound.turn,
      phase: Phase.playPhase,
      mustPlayCard,
    },
  };
  updateRound(game, updatedRound);
}

function sortMatchSet(matchSet: Array<{ owner: string; card: Card }>) {
  return matchSet.sort((a, b) => a.card.value - b.card.value);
}

function insertCardsIntoTable(
  currentTable: Table,
  selectedCards: Card[],
  currentUid: string
): Table {
  const newTable: { [index: number]: MatchSet } = {};
  const cardsToMatchSet = selectedCards.map((card) => ({
    owner: currentUid,
    card,
  }));
  let inserted = false;
  Object.values(currentTable).forEach((set, index) => {
    const cardsInSet = set.map(({ card }) => card);
    if (isValidSet([...cardsInSet, ...selectedCards])) {
      newTable[index] = sortMatchSet([...set, ...cardsToMatchSet]);
      inserted = true;
    } else {
      newTable[index] = set;
    }
  });
  if (!inserted) {
    newTable[Object.values(currentTable).length] = sortMatchSet(
      cardsToMatchSet
    );
  }
  return newTable;
}

export function layDown(selectedCards: Card[], currentUid: string, game: Game) {
  const currentRound = getCurrentRound(game);
  const currentHand = currentRound.playerCards[currentUid].hand;
  const newHand = currentHand.filter(
    (card) =>
      !selectedCards.some((selectedCard) => isSameCard(selectedCard, card))
  );

  const currentTable = currentRound.table;
  const newTable = insertCardsIntoTable(
    currentTable,
    selectedCards,
    currentUid
  );

  const mustPlayCard = currentRound.turn.mustPlayCard;
  const playedMustPlayCard =
    mustPlayCard &&
    selectedCards.some((selectedCard) =>
      isSameCard(selectedCard, mustPlayCard)
    );

  const updatedRound = {
    ...currentRound,
    playerCards: {
      ...currentRound.playerCards,
      [currentUid]: {
        ...currentRound.playerCards[currentUid],
        hand: newHand,
      },
    },
    turn: {
      ...currentRound.turn,
      mustPlayCard: playedMustPlayCard ? null : mustPlayCard,
    },
    table: newTable,
  };
  updateRound(game, updatedRound);
}

export function discard(
  selectedCard: Card,
  game: Game,
  currentUid: string,
  opponentUid: string
) {
  const currentRound = getCurrentRound(game);
  const currentHand = currentRound.playerCards[currentUid].hand;
  const newHand = currentHand.filter((card) => !isSameCard(selectedCard, card));

  const updatedRound = {
    ...currentRound,
    discard: [...currentRound.discard, selectedCard],
    playerCards: {
      ...currentRound.playerCards,
      [currentUid]: {
        ...currentRound.playerCards[currentUid],
        hand: newHand,
      },
    },
    turn: {
      ...currentRound.turn,
      player: opponentUid,
      phase: Phase.startPhase,
      mustPlayCard: null,
    },
  };

  const isEndOfRound = newHand.length === 0 || currentRound.deck.length === 0;

  const updatedRounds = [
    ...game.rounds.slice(0, game.rounds.length - 1),
    updatedRound,
  ];
  const [yourScore, opponentScore] = calculateRoundScoreSums(
    updatedRounds,
    currentUid,
    opponentUid
  );
  const isEndOfGame = yourScore >= 500 || opponentScore >= 500;

  if (isEndOfRound && isEndOfGame) {
    db.collection(Collections.games).doc(game.id).update({
      status: GameStatus.ended,
      rounds: updatedRounds,
    });
  } else if (isEndOfRound) {
    db.collection(Collections.games)
      .doc(game.id)
      .update({
        rounds: updatedRounds.concat(initializeRound(currentUid, opponentUid)),
      });
  } else {
    updateRound(game, updatedRound);
  }
}

export function reorderHand(
  card: Card,
  from: number,
  to: number,
  game: Game,
  currentUid: string
) {
  const currentRound = getCurrentRound(game);
  const newHand = [...currentRound.playerCards[currentUid].hand];
  newHand.splice(from, 1);
  newHand.splice(to, 0, card);
  const updatedRound = {
    ...currentRound,
    playerCards: {
      ...currentRound.playerCards,
      [currentUid]: {
        ...currentRound.playerCards[currentUid],
        hand: newHand,
      },
    },
  };
  updateRound(game, updatedRound);
}
