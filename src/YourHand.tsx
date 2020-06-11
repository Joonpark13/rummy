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
import { Round, Card as CardType, Game, User, Phase } from './types';
import { useCurrentUser, layDown, discard } from './firebase';
import { isSameCard, isValidSet, canAddMultipleCardsToSet, getCardDisplayValue, getCardDisplaySuit } from './util';

function selectionIncludesCard(selectedCards: CardType[], card: CardType) {
  return selectedCards.some((selectedCard) => isSameCard(card, selectedCard));
}

type YourHandProps = {
  round: Round;
  open: boolean;
  game: Game;
  opponent: User;
  onChange: () => void;
  onLayDown: () => void;
  onIllegalAction: () => void;
};

export default function YourHand({
  round,
  open,
  game,
  opponent,
  onChange,
  onLayDown,
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
  const yourTurn = round.turn.player === currentUser.uid;
  const mustPlayCard = round.turn.mustPlayCard;
  const currentPhase = round.turn.phase;

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
        onLayDown();
      } else {
        onIllegalAction();
      }
    }
  }

  function handleDiscard() {
    if (currentUser) {
      discard(selectedCards[0], game, currentUser.uid, opponent.uid);
      setSelectedCards([]);
    }
  }

  return (
    <ExpansionPanel expanded={open} onChange={onChange}>
      <ExpansionPanelSummary expandIcon={<ExpandLess />}>
        <Typography variant="body1">Your hand</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {yourTurn && mustPlayCard && (
          <Box mb="2px">
            <Typography variant="caption" color="error">
              You must play the {getCardDisplayValue(mustPlayCard.value)} of {getCardDisplaySuit(mustPlayCard.suit)}.
            </Typography>
          </Box>
        )}
        <Box display="flex" flexWrap="wrap">
          {yourHand.map((card) => (
            <Card
              key={JSON.stringify(card)}
              suit={card.suit}
              value={card.value}
              selected={selectionIncludesCard(selectedCards, card)}
              onClick={yourTurn ? () => handleSelect(card) : undefined}
            />
          ))}
        </Box>
      </ExpansionPanelDetails>
      <ExpansionPanelActions>
        <Button size="small" color="primary" disabled={!yourTurn || selectedCards.length < 1} onClick={handleLayDown}>
          Lay down
        </Button>
        <Button
          size="small"
          disabled={!yourTurn || selectedCards.length !== 1 || currentPhase !== Phase.playPhase}
          onClick={handleDiscard}
        >
          Discard
        </Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
}
