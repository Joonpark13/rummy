import React, { useState } from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useUser, useCurrentUser } from './firebase';
import { Game } from './types';
import GameDialog from './GameDialog';

type GameListItemProps = {
  game: Game;
};

export default function GameListItem({ game }: GameListItemProps) {
  const currentUser = useCurrentUser();
  const opponentId = currentUser
    ? game.players.find((playerId) => playerId !== currentUser.uid)
    : null;
  const opponent = useUser(opponentId as string | null);
  const [open, setOpen] = useState(false);

  if (!opponent) {
    return null;
  }
  return (
    <>
      <ListItem button onClick={() => setOpen(true)}>
        <ListItemText primary={opponent.displayName} />
      </ListItem>
      <GameDialog
        open={open}
        game={game}
        opponent={opponent}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
