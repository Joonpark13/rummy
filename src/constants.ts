import { Suit } from './types';

const spades = [];
const diamonds = [];
const hearts = [];
const clubs = [];
for (let i = 1; i < 13; i += 1) {
  spades.push({ suit: Suit.spade, value: i });
  diamonds.push({ suit: Suit.diamond, value: i });
  hearts.push({ suit: Suit.heart, value: i });
  clubs.push({ suit: Suit.club, value: i });
}
export const ORDERED_DECK = [...spades, ...diamonds, ...hearts, ...clubs];

export const HAND_SIZE = 7;

export const EXPANSION_PANEL_HEIGHT = '48px';
