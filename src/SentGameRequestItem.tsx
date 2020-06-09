import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { useUser, GameRequest, GameRequestStatus, removeRequest } from './firebase';

type SentGameRequestItemProps = {
  gameRequest: GameRequest;
};

export default function SentGameRequestItem({ gameRequest }: SentGameRequestItemProps) {
  const user = useUser(gameRequest.to);

  if (!user) {
    return null;
  }
  return (
    <ListItem>
      <ListItemText
        primary={gameRequest.status === GameRequestStatus.pending ? 'Request sent to' : 'Request declined'}
        secondary={user.displayName}
      />
      {gameRequest.status === GameRequestStatus.declined && (
        <ListItemSecondaryAction>
          <IconButton onClick={() => removeRequest(gameRequest)}>
            <Delete />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}
