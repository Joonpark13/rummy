import { useState, useEffect } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

enum Collections {
  users = 'users',
  requests = 'requests',
}

export type User = {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
};

export enum GameRequestStatus {
  pending = 'PENDING',
  declined = 'DECLINED',
}

export type GameRequest = {
  id: string;
  from: string;
  to: string;
  status: GameRequestStatus;
};

const firebaseConfig = {
  apiKey: 'AIzaSyCUX6oYXngvqjDR29JBam1LPa2FoaZmRA8',
  authDomain: 'rummy-500.firebaseapp.com',
  databaseURL: 'https://rummy-500.firebaseio.com',
  projectId: 'rummy-500',
  storageBucket: 'rummy-500.appspot.com',
  messagingSenderId: '119518676647',
  appId: '1:119518676647:web:df558bbe6e60b07dafbd82',
  measurementId: 'G-27YTQDMRCM',
};

firebase.initializeApp(firebaseConfig);

export default firebase;

const db = firebase.firestore();

export function useCurrentUser() {
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      }),
    [setUser]
  );

  return user;
}

export function useIsSignedIn() {
  const user = useCurrentUser();
  return Boolean(user);
}

export async function userExists(uid: string) {
  const docRef = await db.collection(Collections.users).doc(uid).get();
  return docRef.exists;
}

function queryUserEmail(email: string) {
  return db.collection(Collections.users).where('email', '==', email).get();
}

export async function findUserByEmail(email: string) {
  const querySnapshot = await queryUserEmail(email);
  return querySnapshot.docs[0].data();
}

export async function userEmailExists(email: string) {
  const querySnapshot = await queryUserEmail(email);
  return !querySnapshot.empty;
}

export function addUserToFirestore(user: firebase.User) {
  const data = {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    uid: user.uid,
  };
  db.collection(Collections.users).doc(user.uid).set(data);
}

export function signOut() {
  firebase.auth().signOut();
}

export function createGameRequest(recipientUid: string, senderUid: string) {
  db.collection(Collections.requests).add({
    from: senderUid,
    to: recipientUid,
    status: GameRequestStatus.pending,
  });
}

function queryRequest(
  field: string,
  uid: string,
  setter: (value: GameRequest[]) => void
) {
  return db
    .collection(Collections.requests)
    .where(field, '==', uid)
    .onSnapshot((querySnapshot) => {
      setter(
        querySnapshot.docs.map(
          (queryDocSnapshot) =>
            ({
              id: queryDocSnapshot.id,
              ...queryDocSnapshot.data(),
            } as GameRequest)
        )
      );
    });
}

export function useGameRequests() {
  const user = useCurrentUser();
  const [sentGameRequests, setSentGameRequests] = useState<GameRequest[]>([]);
  const [receivedGameRequests, setReceivedGameRequests] = useState<
    GameRequest[]
  >([]);

  useEffect(() => {
    if (user) {
      return queryRequest('from', user.uid, setSentGameRequests);
    }
  }, [setSentGameRequests, user]);

  useEffect(() => {
    if (user) {
      return queryRequest('to', user.uid, setReceivedGameRequests);
    }
  }, [setReceivedGameRequests, user]);

  return [sentGameRequests, receivedGameRequests];
}

export function useUser(uid: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const doc = await db.collection(Collections.users).doc(uid).get();
      setUser(doc.data() as User);
    })();
  }, [uid, setUser]);

  return user;
}

export async function pendingGameRequestExists(
  currentUid: string,
  recipientEmail: string
): Promise<boolean> {
  const { uid: recipientUid } = await findUserByEmail(recipientEmail);
  const querySnapshot = await db
    .collection(Collections.requests)
    .where('from', '==', currentUid)
    .where('to', '==', recipientUid)
    .get();
  return !querySnapshot.empty;
}

export function removeRequest(gameRequest: GameRequest) {
  db.collection(Collections.requests).doc(gameRequest.id).delete();
}

export function createGame(gameRequest: GameRequest) {}
