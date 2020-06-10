import React, { useState } from 'react';
import { Dialog, AppBar, Toolbar, IconButton, Box } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { Game, User } from './types';
import RoundSummary from './RoundSummary';
import OpponentCards from './OpponentCards';
import PlayArea from './PlayArea';
import YourTable from './YourTable';
import YourHand from './YourHand';

type GameDialogProps = {
  open: boolean;
  game: Game;
  opponent: User;
  onClose: () => void;
};

export default function GameDialog({
  open,
  game,
  opponent,
  onClose,
}: GameDialogProps) {
  const [yourHandOpen, setYourHandOpen] = useState(false);

  const currentRound = game.rounds[game.rounds.length - 1];

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <ArrowBack />
          </IconButton>
        </Toolbar>
      </AppBar>

      <RoundSummary game={game} opponent={opponent} />

      <Box
        p={2}
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <OpponentCards round={currentRound} opponent={opponent} />
        <PlayArea game={game} onDraw={() => setYourHandOpen(true)} />
        <YourTable round={currentRound} />
      </Box>

      <Box position="fixed" bottom={0} width="100%">
        <YourHand
          round={currentRound}
          open={yourHandOpen}
          onChange={() => setYourHandOpen(!yourHandOpen)}
        />
      </Box>
    </Dialog>
  );
}
