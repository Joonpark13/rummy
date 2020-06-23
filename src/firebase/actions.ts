import shuffle from 'shuffle-array';
import firebase, { db } from './init';
import { getRounds } from './selectors';
import {
  Collections,
  GameRequestStatus,
  GameRequest,
  GameStatus,
  Game,
  Round,
  Card,
  Phase,
  Table,
  MatchSet,
} from '../types';
import {
  isSameCard,
  isValidSet,
  calculateTotalScores,
  calculateRoundScores,
} from '../util';
import { ORDERED_DECK, HAND_SIZE } from '../constants';

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
    startTime: firebase.firestore.Timestamp.fromDate(new Date()),
  };
}

export async function createGame(gameRequest: GameRequest) {
  const docRef = await db.collection(Collections.rounds).add({
    ...initializeRound(gameRequest.from, gameRequest.to),
  });
  removeRequest(gameRequest);
  db.collection(Collections.games).add({
    players: [gameRequest.from, gameRequest.to],
    rounds: [docRef.id],
    status: GameStatus.ongoing,
    startTime: firebase.firestore.Timestamp.fromDate(new Date()),
  });
}

function updateRound(roundId: string, data: firebase.firestore.UpdateData) {
  db.collection(Collections.rounds).doc(roundId).update(data);
}

export async function drawCard(round: Round, currentUid: string) {
  const drawnCard = round.deck[0];
  updateRound(round.id, {
    deck: round.deck.slice(1),
    [`playerCards.${currentUid}.hand`]: [
      ...round.playerCards[currentUid].hand,
      drawnCard,
    ],
    'turn.phase': Phase.playPhase,
  });
}

export function pickUpDiscards(
  round: Round,
  selectedCardIndex: number,
  currentUid: string
): void {
  const cardsPickedUp = round.discard.slice(selectedCardIndex);
  const mustPlayCard = cardsPickedUp.length === 1 ? null : cardsPickedUp[0];

  updateRound(round.id, {
    discard: round.discard.slice(0, selectedCardIndex),
    [`playerCards.${currentUid}.hand`]: [
      ...round.playerCards[currentUid].hand,
      ...cardsPickedUp,
    ],
    'turn.phase': Phase.playPhase,
    'turn.mustPlayCard': mustPlayCard,
  });
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

export function layDown(
  round: Round,
  selectedCards: Card[],
  currentUid: string
) {
  const currentHand = round.playerCards[currentUid].hand;
  const newHand = currentHand.filter(
    (card) =>
      !selectedCards.some((selectedCard) => isSameCard(selectedCard, card))
  );

  const currentTable = round.table;
  const newTable = insertCardsIntoTable(
    currentTable,
    selectedCards,
    currentUid
  );

  const mustPlayCard = round.turn.mustPlayCard;
  const playedMustPlayCard =
    mustPlayCard &&
    selectedCards.some((selectedCard) =>
      isSameCard(selectedCard, mustPlayCard)
    );

  updateRound(round.id, {
    [`playerCards.${currentUid}.hand`]: newHand,
    'turn.mustPlayCard': playedMustPlayCard ? null : mustPlayCard,
    table: newTable,
  });
}

export async function discard(
  round: Round,
  selectedCard: Card,
  game: Game,
  currentUid: string,
  opponentUid: string
) {
  const currentHand = round.playerCards[currentUid].hand;
  const newHand = currentHand.filter((card) => !isSameCard(selectedCard, card));
  const newDiscard = [...round.discard, selectedCard];
  const newTurn = {
    ...round.turn,
    player: opponentUid,
    phase: Phase.startPhase,
    mustPlayCard: null,
  };

  const updatedRound = {
    ...round,
    discard: newDiscard,
    playerCards: {
      ...round.playerCards,
      [currentUid]: {
        ...round.playerCards[currentUid],
        hand: newHand,
      },
    },
    turn: newTurn,
  };

  const isEndOfRound = newHand.length === 0 || round.deck.length === 0;

  const allRounds = await getRounds(game);
  let [yourScore, opponentScore] = calculateTotalScores(
    allRounds.splice(0, game.rounds.length - 1),
    currentUid,
    opponentUid
  );
  const [yourScoreThisRound, opponentScoreThisRound] = calculateRoundScores(
    updatedRound,
    currentUid,
    opponentUid
  );
  yourScore += yourScoreThisRound;
  opponentScore += opponentScoreThisRound;
  const isEndOfGame = yourScore >= 500 || opponentScore >= 500;

  updateRound(round.id, {
    discard: newDiscard,
    [`playerCards.${currentUid}.hand`]: newHand,
    turn: newTurn,
  });

  if (isEndOfRound && isEndOfGame) {
    db.collection(Collections.games).doc(game.id).update({
      status: GameStatus.ended,
    });
  } else if (isEndOfRound) {
    const docRef = await db
      .collection(Collections.rounds)
      .add(initializeRound(currentUid, opponentUid));
    db.collection(Collections.games)
      .doc(game.id)
      .update({
        rounds: firebase.firestore.FieldValue.arrayUnion(docRef.id),
      });
  }
}

export function reorderHand(
  round: Round,
  card: Card,
  from: number,
  to: number,
  currentUid: string
) {
  const newHand = [...round.playerCards[currentUid].hand];
  newHand.splice(from, 1);
  newHand.splice(to, 0, card);
  updateRound(round.id, {
    [`playerCards.${currentUid}.hand`]: newHand,
  });
}
