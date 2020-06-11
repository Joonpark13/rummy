import React, { useState } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { Game, User } from './types';
import RoundSummary from './RoundSummary';
import OpponentCards from './OpponentCards';
import PlayArea from './PlayArea';
import YourTable from './YourTable';
import YourHand from './YourHand';
import { getCurrentRound } from './util';

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
  const [illegalActionModalOpen, setIllegalActionModalOpen] = useState(false);

  const currentRound = getCurrentRound(game);

  function showIllegalActionModal() {
    setIllegalActionModalOpen(true);
  }

  function closeIllegalActionModal() {
    setIllegalActionModalOpen(false);
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">
            {currentRound.turn === opponent.uid
              ? `${opponent.displayName}'s`
              : 'Your'}{' '}
            Turn
          </Typography>
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
        <PlayArea
          game={game}
          onAction={() => setYourHandOpen(true)}
          onIllegalAction={showIllegalActionModal}
        />
        <YourTable round={currentRound} />
      </Box>

      <Box position="fixed" bottom={0} width="100%">
        <YourHand
          round={currentRound}
          open={yourHandOpen}
          game={game}
          opponent={opponent}
          onChange={() => setYourHandOpen(!yourHandOpen)}
          onIllegalAction={showIllegalActionModal}
        />
      </Box>

      <Dialog open={illegalActionModalOpen} onClose={closeIllegalActionModal}>
        <DialogTitle>That action is not allowed.</DialogTitle>
        <DialogActions>
          <Button onClick={closeIllegalActionModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
