import React, { useState } from 'react';
import styled from 'styled-components';
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd';
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
import { useCurrentUser } from './firebase/hooks';
import { layDown, discard, reorderHand } from './firebase/actions';
import {
  isSameCard,
  isValidSet,
  canAddMultipleCardsToSet,
  getCardDisplayValue,
  getCardDisplaySuit,
} from './util';

const StyledExpansionPanelDetails = styled(ExpansionPanelDetails)`
  display: block;
`;

const FlexBox = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

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
      const canAddToExistingSet = canAddMultipleCardsToSet(
        selectedCards,
        Object.values(round.table)
      );
      if (
        (handIsValid || canAddToExistingSet) &&
        selectedCards.length !== yourHand.length
      ) {
        layDown(round, selectedCards, currentUser.uid);
        setSelectedCards([]);
        onLayDown();
      } else {
        onIllegalAction();
      }
    }
  }

  function handleDiscard() {
    if (currentUser) {
      discard(round, selectedCards[0], game, currentUser.uid, opponent.uid);
      setSelectedCards([]);
    }
  }

  function handleDrag({ source, destination, draggableId }: DropResult) {
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (currentUser) {
      const card = JSON.parse(draggableId);
      reorderHand(round, card, source.index, destination.index, currentUser.uid);
    }
  }

  return (
    <ExpansionPanel expanded={open} onChange={onChange}>
      <ExpansionPanelSummary expandIcon={<ExpandLess />}>
        <Typography variant="body1">Your hand</Typography>
      </ExpansionPanelSummary>
      <StyledExpansionPanelDetails>
        {yourTurn && mustPlayCard && (
          <Box mb="2px">
            <Typography variant="caption" color="error">
              You must play the {getCardDisplayValue(mustPlayCard.value)} of{' '}
              {getCardDisplaySuit(mustPlayCard.suit)}.
            </Typography>
          </Box>
        )}
        <DragDropContext onDragEnd={handleDrag}>
          <Droppable droppableId="your-hand-droppable" direction="horizontal">
            {(provided) => (
              <FlexBox ref={provided.innerRef} {...provided.droppableProps}>
                {yourHand.map((card, index) => (
                  <Draggable
                    key={JSON.stringify(card)}
                    draggableId={JSON.stringify(card)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card
                          suit={card.suit}
                          value={card.value}
                          selected={selectionIncludesCard(selectedCards, card)}
                          onClick={
                            yourTurn ? () => handleSelect(card) : undefined
                          }
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </FlexBox>
            )}
          </Droppable>
        </DragDropContext>
      </StyledExpansionPanelDetails>
      <ExpansionPanelActions>
        <Button
          size="small"
          color="primary"
          disabled={!yourTurn || selectedCards.length < 1}
          onClick={handleLayDown}
        >
          Lay down
        </Button>
        <Button
          size="small"
          disabled={
            !yourTurn ||
            selectedCards.length !== 1 ||
            currentPhase !== Phase.playPhase ||
            round.turn.mustPlayCard !== null
          }
          onClick={handleDiscard}
        >
          Discard
        </Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
}
