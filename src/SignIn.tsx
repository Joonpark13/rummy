import React from 'react';
import firebase from './firebase/init';
import { addUserToFirestore } from './firebase/actions';
import { userExists } from './firebase/selectors';
import { StyledFirebaseAuth } from 'react-firebaseui';

const uiConfig = {
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: ({ user }: { user: firebase.User }) => {
      handleInitialSignIn(user);
      return false; // Don't handle redirect for me
    },
  },
};

async function handleInitialSignIn(user: firebase.User) {
  if (!(await userExists(user.uid))) {
    addUserToFirestore(user);
  }
}

export default function SignIn() {
  return (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
  );
}
