import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';
import { useUser } from './firebase/hooks';
import { createGame } from './firebase/actions';
import { GameRequest } from './types';

type ReceivedGameRequestItemProps = {
  gameRequest: GameRequest;
};

export default function ReceivedGameRequestItem({
  gameRequest,
}: ReceivedGameRequestItemProps) {
  const user = useUser(gameRequest.from);

  if (!user) {
    return null;
  }
  return (
    <ListItem>
      <ListItemText
        primary={user.displayName}
        secondary="wants to play rummy!"
      />
      <ListItemSecondaryAction>
        <IconButton onClick={() => createGame(gameRequest)}>
          <PlayArrow />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
