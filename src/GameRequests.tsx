import React from 'react';
import { List, Divider, Typography } from '@material-ui/core';
import HomeSection from './components/HomeSection';
import SentGameRequestItem from './SentGameRequestItem';
import ReceivedGameRequestItem from './ReceivedGameRequestItem';
import { useGameRequests } from './firebase';

export default function GameRequests() {
  const [sentGameRequests, receivedGameRequests] = useGameRequests();

  return (
    <HomeSection title="Game Requests">
      {receivedGameRequests.length === 0 && sentGameRequests.length === 0 && (
        <Typography variant="body1">No requests to display.</Typography>
      )}
      {receivedGameRequests.length !== 0 && (
        <List>
          {receivedGameRequests.map((gameRequest) => (
            <ReceivedGameRequestItem
              key={gameRequest.id}
              gameRequest={gameRequest}
            />
          ))}
        </List>
      )}
      {receivedGameRequests.length !== 0 && sentGameRequests.length !== 0 && (
        <Divider />
      )}
      {sentGameRequests.length !== 0 && (
        <List>
          {sentGameRequests.map((gameRequest) => (
            <SentGameRequestItem
              key={gameRequest.id}
              gameRequest={gameRequest}
            />
          ))}
        </List>
      )}
    </HomeSection>
  );
}
