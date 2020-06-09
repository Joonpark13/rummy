import React from 'react';
import { Box } from '@material-ui/core';
import GameRequests from './GameRequests';
import CurrentGames from './CurrentGames';
import StartNewGame from './StartNewGame';

export default function Home() {
  return (
    <Box p={2}>
      <Box mb={3}>
        <GameRequests />
      </Box>
      <Box mb={3}>
        <CurrentGames />
      </Box>
      <StartNewGame />
    </Box>
  );
}
