import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Box } from '@material-ui/core';
import SignIn from './SignIn';
import Home from './Home';
import Nav from './Nav';
import { useIsSignedIn, reorderHand } from './firebase';
import { Card, Game } from './types';

function App() {
  const isSignedIn = useIsSignedIn();

  function handleDrag({ source, destination, draggableId }: DropResult) {
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const {
      game,
      currentUid,
      card,
    }: { game: Game; currentUid: string; card: Card } = JSON.parse(draggableId);
    reorderHand(card, source.index, destination.index, game, currentUid);
  }

  return (
    <DragDropContext onDragEnd={handleDrag}>
      <Box component="main" height="100%">
        <Nav />
        {isSignedIn ? <Home /> : <SignIn />}
      </Box>
    </DragDropContext>
  );
}

export default App;
