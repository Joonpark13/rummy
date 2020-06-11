import React from 'react';
import {
  Typography,
  Box,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { Game, Round, User, Card } from './types';
import { EXPANSION_PANEL_HEIGHT } from './constants';
import { useCurrentUser } from './firebase';

type RoundSummaryProps = {
  opponent: User;
  game: Game;
};

function roundEnded(round: Round): boolean {
  if (round.deck.length === 0) {
    return true;
  }
  const anyPlayerHasEmptyHand = Object.values(round.playerCards)
    .map((playerCards) => playerCards.hand)
    .some((hand) => hand.length === 0);
  if (anyPlayerHasEmptyHand) {
    return true;
  }
  return false;
}

function getCardScoreValue(card: Card): number {
  if (card.value === 1) {
    return 15;
  }
  if (card.value >= 10) {
    return 10;
  }
  return 5;
}

function calculateScore(cards: Card[]): number {
  let sum = 0;
  cards.forEach((card) => {
    sum += getCardScoreValue(card);
  });
  return sum;
}

function calculateRoundScores(
  rounds: Round[],
  currentUid: string,
  opponentUid: string
) {
  return rounds.map((round) => {
    let yourScore = 0;
    let opponentScore = 0;
    yourScore += calculateScore(
      Object.values(round.playerCards[currentUid].laid).flat()
    );
    yourScore -= calculateScore(round.playerCards[currentUid].hand);
    opponentScore += calculateScore(
      Object.values(round.playerCards[opponentUid].laid).flat()
    );
    opponentScore -= calculateScore(round.playerCards[opponentUid].hand);
    return [yourScore, opponentScore];
  });
}

export default function RoundSummary({ opponent, game }: RoundSummaryProps) {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    return null;
  }

  const previousRounds = game.rounds.filter((round) => roundEnded(round));
  const scoresPerRound = calculateRoundScores(
    previousRounds,
    currentUser.uid,
    opponent.uid
  );
  const yourScore = scoresPerRound.reduce(
    (total, scorePair) => total + scorePair[0],
    0
  );
  const opponentScore = scoresPerRound.reduce(
    (total, scorePair) => total + scorePair[1],
    0
  );

  return (
    <Box position="relative" height={EXPANSION_PANEL_HEIGHT}>
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <Typography variant="body1">
            You: {yourScore} vs {opponent.displayName}: {opponentScore}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {scoresPerRound.length === 0 ? (
            <Typography variant="caption">No previous rounds yet.</Typography>
          ) : (
            scoresPerRound.map((scorePair, index) => (
              <div key={index}>
                <Typography variant="body1">Round {index + 1}:</Typography>
                <Typography variant="caption">
                  You: {scorePair[0]}, {opponent.displayName}: {scorePair[1]}
                </Typography>
              </div>
            ))
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Box>
  );
}
