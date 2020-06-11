import React from 'react';
import HomeSection from './components/HomeSection';
import { usePreviousGames } from './firebase';
import { Typography, List } from '@material-ui/core';
import GameListItem from './GameListItem';

export default function CurrentGames() {
  const pastGames = usePreviousGames();

  return (
    <HomeSection title="Previous Games">
      {pastGames.length === 0 ? (
        <Typography variant="body1">No games to display.</Typography>
      ) : (
        <List>
          {pastGames.map((game) => (
            <GameListItem key={game.id} game={game} />
          ))}
        </List>
      )}
    </HomeSection>
  );
}
