import React from 'react';
import { Box } from '@material-ui/core';
import Card from './Card';
import { MatchSet as MatchSetType } from '../types';

type MatchSetProps = {
  matchSet: MatchSetType;
};

export default function MatchSet({ matchSet }: MatchSetProps) {
  return (
    <Box display="flex">
      {matchSet.map(({ card }) => (
        <Card key={JSON.stringify(card)} suit={card.suit} value={card.value} />
      ))}
    </Box>
  );
}
