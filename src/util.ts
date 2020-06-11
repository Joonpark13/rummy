import { combination } from 'js-combinatorics';
import { Game, Round, Card, Suit } from './types';

export function getCurrentRound(game: Game): Round {
  return game.rounds[game.rounds.length - 1];
}

export function isValidSet(cards: Card[]) {
  if (cards.length < 3) {
    return false;
  }
  if (cards.every((card) => card.value === cards[0].value)) {
    return true;
  }
  const allSameSuit = cards.every((card) => card.suit === cards[0].suit);
  const cardValues = cards.map((card) => card.value);
  cardValues.sort((a, b) => a - b);
  const contiguous = cardValues.every((value, index) => {
    if (index === 0) {
      return true;
    }
    return value - 1 === cardValues[index - 1];
  });
  return allSameSuit && contiguous;
}

export function canAddToSet(card: Card, sets: Card[][]) {
  return sets.some((set) => isValidSet([...set, card]));
}

export function canAddMultipleCardsToSet(cards: Card[], sets: Card[][]) {
  return sets.some((set) => isValidSet([...set, ...cards]));
}

export function isSameCard(card1: Card, card2: Card) {
  return card1.suit === card2.suit && card1.value === card2.value;
}

export function containsValidSetUsingCard(hand: Card[], card: Card) {
  const searchLimit = hand.length > 13 ? 13 : hand.length;
  for (let i = 3; i < searchLimit; i += 1) {
    const generator = combination(hand, i);
    let set = generator.next();
    while (set) {
      if (isValidSet(set) && set.some((c) => isSameCard(c, card))) {
        return true;
      }
      set = generator.next();
    }
  }
  return false;
}

export function getCardDisplayValue(value: number) {
  if (value === 1) {
    return 'A';
  }
  if (value === 11) {
    return 'J';
  }
  if (value === 12) {
    return 'Q';
  }
  if (value === 13) {
    return 'K';
  }
  return value;
}

export function getCardDisplaySuit(suit: Suit): string {
  switch (suit) {
    case Suit.spade:
      return 'Spades';
    case Suit.diamond:
      return 'Diamonds';
    case Suit.heart:
      return 'Hearts';
    default:
      return 'Clubs';
  }
}

function getCardScoreValue(card: Card): number {
  if (card.value === 1) {
    return 15;
  }
  if (card.value >= 10) {
    return 10;
  }
  return 5;
}

function calculateScore(cards: Card[]): number {
  let sum = 0;
  cards.forEach((card) => {
    sum += getCardScoreValue(card);
  });
  return sum;
}

export function calculateRoundScores(
  rounds: Round[],
  currentUid: string,
  opponentUid: string
): Array<[number, number]> {
  return rounds.map((round) => {
    let yourScore = 0;
    let opponentScore = 0;
    yourScore += calculateScore(
      Object.values(round.playerCards[currentUid].laid).flat()
    );
    yourScore -= calculateScore(round.playerCards[currentUid].hand);
    opponentScore += calculateScore(
      Object.values(round.playerCards[opponentUid].laid).flat()
    );
    opponentScore -= calculateScore(round.playerCards[opponentUid].hand);
    const scores: [number, number] = [yourScore, opponentScore];
    return scores;
  });
}

export function calculateRoundScoreSums(
  rounds: Round[],
  currentUid: string,
  opponentUid: string
) {
  const scores = calculateRoundScores(rounds, currentUid, opponentUid);
  const yourTotalScore = scores
    .map((score) => score[0])
    .reduce((total, score) => total + score, 0);
  const opponentTotalScore = scores
    .map((score) => score[1])
    .reduce((total, score) => total + score, 0);
  return [yourTotalScore, opponentTotalScore];
}
