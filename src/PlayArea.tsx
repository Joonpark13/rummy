import React, { useState } from 'react';
import {
  Box,
  Card as MUICard,
  CardContent,
  CardActions,
  Button,
} from '@material-ui/core';
import Card from './components/Card';
import { drawCard, useCurrentUser, pickUpDiscards } from './firebase';
import { Game } from './types';
import {
  getCurrentRound,
  containsValidSetUsingCard,
  canAddToSet,
} from './util';

type PlayAreaProps = {
  game: Game;
  onAction: () => void;
  onIllegalAction: () => void;
};

export default function PlayArea({
  game,
  onAction,
  onIllegalAction,
}: PlayAreaProps) {
  const [pickUpCardIndex, setPickUpCardIndex] = useState<null | number>(null);
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return null;
  }

  const currentRound = getCurrentRound(game);

  function canPickUp(pickUpCardIndex: number) {
    if (pickUpCardIndex === currentRound.discard.length - 1) {
      return true;
    }
    if (!currentUser) {
      return false;
    }
    const pickedUpCards = currentRound.discard.slice(pickUpCardIndex);
    const mustPlayCard = pickedUpCards[0];

    const playersCards = Object.values(currentRound.playerCards);
    const allPlayedSets = [
      ...Object.values(playersCards[0].laid),
      ...Object.values(playersCards[1].laid),
    ];
    const canAddToExistingSet = canAddToSet(mustPlayCard, allPlayedSets);

    const wouldBeHand = [
      ...currentRound.playerCards[currentUser.uid].hand,
      ...pickedUpCards,
    ];
    const handContainsValidSet = containsValidSetUsingCard(
      wouldBeHand,
      mustPlayCard
    );

    return canAddToExistingSet || handContainsValidSet;
  }

  function handleDraw() {
    if (currentUser) {
      drawCard(game, currentUser.uid);
      onAction();
    }
  }

  function handleSelect(index: number) {
    if (pickUpCardIndex !== null && index >= pickUpCardIndex) {
      setPickUpCardIndex(null);
    } else {
      setPickUpCardIndex(index);
    }
  }

  function handlePickUp() {
    if (pickUpCardIndex !== null) {
      if (!canPickUp(pickUpCardIndex)) {
        onIllegalAction();
      } else if (currentUser) {
        pickUpDiscards(pickUpCardIndex, game, currentUser.uid);
        setPickUpCardIndex(null);
        onAction();
      }
    }
  }

  return (
    <MUICard>
      <CardContent>
        <Box display="flex" flexWrap="wrap">
          {currentRound.discard.map((card, index) => (
            <Card
              key={JSON.stringify(card)}
              suit={card.suit}
              value={card.value}
              selected={pickUpCardIndex !== null && index >= pickUpCardIndex}
              onClick={() => handleSelect(index)}
            />
          ))}
        </Box>
      </CardContent>
      <CardActions>
        {pickUpCardIndex === null ? (
          <Button color="primary" onClick={handleDraw}>
            Draw from deck
          </Button>
        ) : (
          <Button color="primary" onClick={handlePickUp}>
            Pick up selected
          </Button>
        )}
      </CardActions>
    </MUICard>
  );
}
