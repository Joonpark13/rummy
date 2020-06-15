import React from 'react';
import { Box } from '@material-ui/core';
import { useCurrentGames, usePreviousGames } from './firebase/hooks';
import GameRequests from './GameRequests';
import GamesDisplay from './GamesDisplay';
import StartNewGame from './StartNewGame';

export default function Home() {
  const currentGames = useCurrentGames();
  const pastGames = usePreviousGames();

  return (
    <Box p={2}>
      <Box mb={3}>
        <GameRequests />
      </Box>
      <Box mb={3}>
        <GamesDisplay title="Current Games" games={currentGames} />
      </Box>
      <Box mb={3}>
        <GamesDisplay title="Previous Games" games={pastGames} />
      </Box>
      <StartNewGame />
    </Box>
  );
}
