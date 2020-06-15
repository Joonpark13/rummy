import React from 'react';
import HomeSection from './components/HomeSection';
import { Typography, List } from '@material-ui/core';
import GameListItem from './GameListItem';
import { Game } from './types';

type GamesDisplayProps = {
  title: string;
  games: Game[];
};

export default function GamesDisplay({ title, games }: GamesDisplayProps) {
  return (
    <HomeSection title={title}>
      {games.length === 0 ? (
        <Typography variant="body1">No games to display.</Typography>
      ) : (
        <List>
          {games.map((game) => (
            <GameListItem key={game.id} game={game} />
          ))}
        </List>
      )}
    </HomeSection>
  );
}
