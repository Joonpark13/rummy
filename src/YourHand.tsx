import React from 'react';
import {
  Typography,
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
} from '@material-ui/core';
import { ExpandLess } from '@material-ui/icons';
import Card from './components/Card';
import { Round } from './types';
import { useCurrentUser } from './firebase';

type YourHandProps = {
  round: Round;
  open: boolean;
  onChange: () => void;
};

export default function YourHand({ round, open, onChange }: YourHandProps) {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return null;
  }

  const yourHand = round.playerCards[currentUser.uid].hand;
  return (
    <ExpansionPanel expanded={open} onChange={onChange}>
      <ExpansionPanelSummary expandIcon={<ExpandLess />}>
        <Typography variant="body1">Your hand</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Box display="flex" flexWrap="wrap">
          {yourHand.map((card) => (
            <Card
              key={JSON.stringify(card)}
              suit={card.suit}
              value={card.value}
            />
          ))}
        </Box>
      </ExpansionPanelDetails>
      <ExpansionPanelActions>
        <Button size="small" color="primary">
          End Turn
        </Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
}
