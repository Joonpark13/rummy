import React from 'react';
import firebase, { userExists, addUserToFirestore } from './firebase';
import { StyledFirebaseAuth } from 'react-firebaseui';

const uiConfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: ({ user }: { user: firebase.User }) => {
      handleInitialSignIn(user);
      return false; // Don't handle redirect for me
    },
  },
};

async function handleInitialSignIn(user: firebase.User) {
  if (!await userExists(user.uid)) {
    addUserToFirestore(user);
  }
}

export default function SignIn() {
  return (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
  );
}
