import React from 'react';
import { Box, Typography } from '@material-ui/core';
import GameRequests from './GameRequests';
import StartNewGame from './StartNewGame';

export default function Home() {
  return (
    <Box p={2}>
      <Box mb={2}>
        <GameRequests />
      </Box>

      <Typography variant="h5">Current Games</Typography>

      <StartNewGame />
    </Box>
  );
}
