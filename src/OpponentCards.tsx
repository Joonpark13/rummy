import React from 'react';
import { Typography, Box } from '@material-ui/core';
import EmptyCard from './components/EmptyCard';
import MatchSets from './components/MatchSets';
import { Round, User } from './types';
import { getUserMatchSets } from './util';

type OpponentCardsProps = {
  round: Round;
  opponent: User;
};

export default function OpponentCards({ round, opponent }: OpponentCardsProps) {
  const opponentCards = round.playerCards[opponent.uid];
  const opponentHand = opponentCards.hand;
  const opponentSets = getUserMatchSets(round.table, opponent.uid);

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

      <MatchSets
        title={`${opponent.displayName}'s table`}
        matchSets={opponentSets}
      />
    </div>
  );
}
