import React from 'react';
import styled from 'styled-components';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';
import { useIsSignedIn, signOut } from './firebase';

const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
`;

export default function Nav() {
  const isSignedIn = useIsSignedIn();

  return (
    <AppBar position="sticky">
      <StyledToolbar>
        <Typography variant="h6">Rummy 500</Typography>
        {isSignedIn && (
          <Button color="inherit" onClick={signOut}>
            Sign Out
          </Button>
        )}
      </StyledToolbar>
    </AppBar>
  );
}
