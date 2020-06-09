import React from 'react';
import { Box } from '@material-ui/core';
import SignIn from './SignIn';
import Home from './Home';
import Nav from './Nav';
import { useIsSignedIn } from './firebase';

function App() {
  const isSignedIn = useIsSignedIn();

  return (
    <Box component="main" height="100%">
      <Nav />
      {isSignedIn ? <Home /> : <SignIn />}
    </Box>
  );
}

export default App;
