import React, { useState } from 'react';
import {
  Dialog,
  Box,
  DialogTitle,
  DialogActions,
  Button,
} from '@material-ui/core';
import { Game, User, GameStatus } from './types';
import GameDialogHeader from './GameDialogHeader';
import RoundSummary from './RoundSummary';
import OpponentCards from './OpponentCards';
import PlayArea from './PlayArea';
import YourMatchSets from './YourMatchSets';
import YourHand from './YourHand';
import { useCurrentRound } from './firebase/hooks';

type GameDialogProps = {
  open: boolean;
  game: Game;
  currentUser: User;
  opponent: User;
  onClose: () => void;
};

export default function GameDialog({
  open,
  game,
  currentUser,
  opponent,
  onClose,
}: GameDialogProps) {
  const [yourHandOpen, setYourHandOpen] = useState(false);
  const [illegalActionModalOpen, setIllegalActionModalOpen] = useState(false);
  const currentRound = useCurrentRound(game);

  function showIllegalActionModal() {
    setIllegalActionModalOpen(true);
  }

  function closeIllegalActionModal() {
    setIllegalActionModalOpen(false);
  }

  if (!currentUser || !currentRound) {
    return null;
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <GameDialogHeader
        game={game}
        currentUid={currentUser.uid}
        opponent={opponent}
        onClose={onClose}
      />

      <RoundSummary game={game} opponent={opponent} />

      {game.status === GameStatus.ongoing && (
        <>
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
            <YourMatchSets round={currentRound} />
          </Box>

          <Box position="fixed" bottom={0} width="100%">
            <YourHand
              round={currentRound}
              open={yourHandOpen}
              game={game}
              opponent={opponent}
              onChange={() => setYourHandOpen(!yourHandOpen)}
              onLayDown={() => setYourHandOpen(false)}
              onIllegalAction={showIllegalActionModal}
            />
          </Box>

          <Dialog
            open={illegalActionModalOpen}
            onClose={closeIllegalActionModal}
          >
            <DialogTitle>That action is not allowed.</DialogTitle>
            <DialogActions>
              <Button onClick={closeIllegalActionModal}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Dialog>
  );
}
