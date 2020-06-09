import React from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { Game, User } from './firebase';

type GameDialogProps = {
  open: boolean;
  game: Game;
  opponent: User;
  onClose: () => void;
};

export default function GameDialog({
  open,
  opponent,
  onClose,
}: GameDialogProps) {
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">{opponent.displayName}</Typography>
        </Toolbar>
      </AppBar>
    </Dialog>
  );
}
