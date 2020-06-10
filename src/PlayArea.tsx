import React from 'react';
import {
  Box,
  Card as MUICard,
  CardContent,
  CardActions,
  Button,
} from '@material-ui/core';
import Card from './components/Card';
import { drawCard, useCurrentUser } from './firebase';
import { Game } from './types';

type PlayAreaProps = {
  game: Game;
  onDraw: () => void;
};

export default function PlayArea({ game, onDraw }: PlayAreaProps) {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return null;
  }

  const currentRound = game.rounds[game.rounds.length - 1];

  function handleDraw() {
    if (currentUser) {
      drawCard(game, currentUser.uid);
      onDraw();
    }
  }

  return (
    <MUICard>
      <CardContent>
        <Box display="flex" flexWrap="wrap">
          {currentRound.discard.map((card) => (
            <Card
              key={JSON.stringify(card)}
              suit={card.suit}
              value={card.value}
            />
          ))}
        </Box>
      </CardContent>
      <CardActions>
        <Button color="primary" onClick={handleDraw}>
          Draw
        </Button>
      </CardActions>
    </MUICard>
  );
}
