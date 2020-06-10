import React from 'react';
import Card from './components/Card';
import { Card as CardType } from './types';

type MatchSetProps = {
  matchSet: CardType[];
};

export default function MatchSet({ matchSet }: MatchSetProps) {
  return (
    <div>
      {matchSet.map((card) => (
        <Card key={JSON.stringify(card)} suit={card.suit} value={card.value} />
      ))}
    </div>
  );
}
