import { combination } from 'js-combinatorics';
import { Game, Round, Card } from './types';

export function getCurrentRound(game: Game): Round {
  return game.rounds[game.rounds.length - 1];
}

function isValidSet(cards: Card[]) {
  if (cards.length < 3) {
    return false;
  }
  if (cards.every((card) => card.value === cards[0].value)) {
    return true;
  }
  const allSameSuit = cards.every((card) => card.suit === cards[0].suit);
  const cardValues = cards.map((card) => card.value);
  cardValues.sort();
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

function isSameCard(card1: Card, card2: Card) {
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
