import React, { useState } from 'react';
import {
  Button,
  TextField,
  Snackbar,
  SnackbarCloseReason,
  Dialog,
  DialogTitle,
  DialogActions,
  IconButton,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import {
  useCurrentUser,
  userEmailExists,
  createGameRequest,
  findUserByEmail,
  pendingGameRequestExists,
} from './firebase';
import HomeSection from './components/HomeSection';

export default function StartNewGame() {
  const [email, setEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const user = useCurrentUser();

  async function sendRequest(recipientEmail: string) {
    if (!user) {
      return;
    }

    const isOwnEmail = recipientEmail === user.email;
    if (isOwnEmail) {
      setFailureMessage('Must not be your own email.');
      setDialogOpen(true);
    } else if (!(await userEmailExists(recipientEmail))) {
      setFailureMessage('This email is not a valid user.');
      setDialogOpen(true);
    } else if (await pendingGameRequestExists(user.uid, recipientEmail)) {
      setFailureMessage('Pending request to this user already exists.');
      setDialogOpen(true);
    } else {
      const { uid: recipientUid } = await findUserByEmail(recipientEmail);
      const senderUid = user.uid;
      createGameRequest(recipientUid, senderUid);
      setEmail('');
      setSnackbarOpen(true);
    }
  }

  function handleSnackbarClose(
    event: React.SyntheticEvent,
    reason: SnackbarCloseReason
  ) {
    if (reason !== 'clickaway') {
      setSnackbarOpen(false);
    }
  }

  function handleDialogClose() {
    setDialogOpen(false);
  }

  const actions = (
    <Button size="small" onClick={() => sendRequest(email)}>
      Send Request
    </Button>
  );
  return (
    <HomeSection title="Start New Game" actions={actions}>
      <TextField
        label="Enter a user email"
        variant="outlined"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        message="Request sent."
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <Close />
          </IconButton>
        }
      />
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{failureMessage}</DialogTitle>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </HomeSection>
  );
}
