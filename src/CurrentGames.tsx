import React from 'react';
import HomeSection from './components/HomeSection';
import { useCurrentGames } from './firebase';
import { Typography, List } from '@material-ui/core';
import CurrentGameListItem from './CurrentGameListItem';

export default function CurrentGames() {
  const currentGames = useCurrentGames();

  return (
    <HomeSection title="Current Games">
      {currentGames.length === 0 ? (
        <Typography variant="body1">No games to display.</Typography>
      ) : (
        <List>
          {currentGames.map((game) => (
            <CurrentGameListItem key={game.id} game={game} />
          ))}
        </List>
      )}
    </HomeSection>
  );
}
