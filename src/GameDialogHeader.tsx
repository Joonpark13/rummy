import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { calculateTotalScores } from './util';
import { Game, User, GameStatus, Round } from './types';
import { useGameRounds } from './firebase/hooks';

function getHeaderText(
  game: Game,
  rounds: Round[],
  currentUid: string,
  opponent: User
) {
  if (game.status === GameStatus.ended) {
    const [yourScore, opponentScore] = calculateTotalScores(
      rounds,
      currentUid,
      opponent.uid
    );
    if (yourScore > opponentScore) {
      return 'You won!';
    }
    if (opponentScore > yourScore) {
      return 'You lost.';
    }
    return 'You tied.';
  }
  const currentRound = rounds[rounds.length - 1];
  if (currentRound.turn.player === opponent.uid) {
    return `${opponent.displayName}'s Turn`;
  }
  return 'Your Turn';
}

type GameDialogHeaderProps = {
  onClose: () => void;
  game: Game;
  currentUid: string;
  opponent: User;
};

export default function GameDialogHeader({ onClose, game, currentUid, opponent }: GameDialogHeaderProps) {
  const allRounds = useGameRounds(game);

  if (!allRounds) {
    return null;
  }
  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onClose}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">
          {getHeaderText(game, allRounds, currentUid, opponent)}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
