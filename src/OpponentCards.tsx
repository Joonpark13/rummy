import React from 'react';
import { Typography, Box } from '@material-ui/core';
import EmptyCard from './components/EmptyCard';
import Table from './components/Table';
import { Round, User } from './types';

type OpponentCardsProps = {
  round: Round;
  opponent: User;
};

export default function OpponentCards({ round, opponent }: OpponentCardsProps) {
  const opponentCards = round.playerCards[opponent.uid];
  const opponentHand = opponentCards.hand;
  const opponentTable = opponentCards.laid;

  return (
    <div>
      <Typography variant="subtitle1">
        {opponent.displayName}&apos;s hand
      </Typography>
      <Box display="flex" flexWrap="wrap">
        {opponentHand.map((card) => (
          <EmptyCard key={JSON.stringify(card)} />
        ))}
      </Box>

      <Table title={`${opponent.displayName}'s table`} table={opponentTable} />
    </div>
  );
}
