import React, { useState } from 'react';
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
import { Round, Card as CardType, Game, User } from './types';
import { useCurrentUser, layDown } from './firebase';
import { isSameCard, isValidSet, canAddMultipleCardsToSet } from './util';

function selectionIncludesCard(selectedCards: CardType[], card: CardType) {
  return selectedCards.some((selectedCard) => isSameCard(card, selectedCard));
}

type YourHandProps = {
  round: Round;
  open: boolean;
  game: Game;
  opponent: User;
  onChange: () => void;
  onIllegalAction: () => void;
};

export default function YourHand({
  round,
  open,
  game,
  opponent,
  onChange,
  onIllegalAction,
}: YourHandProps) {
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return null;
  }

  const yourHand = round.playerCards[currentUser.uid].hand;
  const opponentTable = round.playerCards[opponent.uid].laid;
  const yourTable = round.playerCards[currentUser.uid].laid;

  function handleSelect(card: CardType) {
    if (selectionIncludesCard(selectedCards, card)) {
      setSelectedCards(
        selectedCards.filter((selectedCard) => !isSameCard(selectedCard, card))
      );
    } else {
      setSelectedCards(selectedCards.concat(card));
    }
  }

  function handleLayDown() {
    if (currentUser) {
      const handIsValid = isValidSet(selectedCards);
      const canAddToOpponentSet = canAddMultipleCardsToSet(
        selectedCards,
        Object.values(opponentTable)
      );
      const canAddToYourSet = canAddMultipleCardsToSet(
        selectedCards,
        Object.values(yourTable)
      );
      if (handIsValid || canAddToOpponentSet || canAddToYourSet) {
        layDown(selectedCards, currentUser.uid, game);
        setSelectedCards([]);
      } else {
        onIllegalAction();
      }
    }
  }

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
              selected={selectionIncludesCard(selectedCards, card)}
              onClick={() => handleSelect(card)}
            />
          ))}
        </Box>
      </ExpansionPanelDetails>
      <ExpansionPanelActions>
        {selectedCards.length === 0 ? (
          <Button size="small" color="primary">
            End Turn
          </Button>
        ) : (
          <>
            <Button size="small" disabled={selectedCards.length !== 1}>
              Discard
            </Button>
            <Button size="small" color="primary" onClick={handleLayDown}>
              Lay down
            </Button>
          </>
        )}
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
}
