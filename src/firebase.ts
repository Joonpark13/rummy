import { useState, useEffect } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

enum Collections {
  users = 'users',
  requests = 'requests',
  games = 'games',
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

enum GameStatus {
  ongoing = 'ONGOING',
  ended = 'ENDED',
}

enum Suit {
  spade = 'SPADE',
  diamond = 'DIAMOND',
  heart = 'HEART',
  club = 'CLUB',
}

type Card = {
  suit: Suit;
  value: number;
};

type Round = {
  deck: Card[];
  discard: Card[];
  playerCards: {
    [uid: string]: {
      hand: Card[];
      laid: Card[][];
    };
  };
};

export type Game = {
  id: string;
  players: string[];
  rounds: Round[];
  status: GameStatus;
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

export function useCurrentUser(): firebase.User | null {
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

export function useIsSignedIn(): boolean {
  const user = useCurrentUser();
  return Boolean(user);
}

export async function userExists(uid: string): Promise<boolean> {
  const docRef = await db.collection(Collections.users).doc(uid).get();
  return docRef.exists;
}

function queryUserEmail(email: string) {
  return db.collection(Collections.users).where('email', '==', email).get();
}

export async function findUserByEmail(email: string): Promise<User> {
  const querySnapshot = await queryUserEmail(email);
  return querySnapshot.docs[0].data() as User;
}

export async function userEmailExists(email: string): Promise<boolean> {
  const querySnapshot = await queryUserEmail(email);
  return !querySnapshot.empty;
}

export function addUserToFirestore(user: firebase.User): void {
  const data = {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    uid: user.uid,
  };
  db.collection(Collections.users).doc(user.uid).set(data);
}

export function signOut(): void {
  firebase.auth().signOut();
}

export function createGameRequest(
  recipientUid: string,
  senderUid: string
): void {
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

export function useGameRequests(): [GameRequest[], GameRequest[]] {
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

export function useUser(uid: string | null): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      if (uid) {
        const doc = await db.collection(Collections.users).doc(uid).get();
        setUser(doc.data() as User);
      }
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

export function removeRequest(gameRequest: GameRequest): void {
  db.collection(Collections.requests).doc(gameRequest.id).delete();
}

export function createGame(gameRequest: GameRequest): void {
  removeRequest(gameRequest);
  db.collection(Collections.games).add({
    players: [gameRequest.from, gameRequest.to],
    rounds: [
      {
        playerCards: {
          [gameRequest.from]: {
            hand: [],
            laid: [],
          },
          [gameRequest.to]: {
            hand: [],
            laid: [],
          },
        },
        deck: [],
        discard: [],
      },
    ],
    status: GameStatus.ongoing,
  });
}

export function useCurrentGames(): Game[] {
  const [games, setGames] = useState<Game[]>([]);
  const user = useCurrentUser();

  useEffect(() => {
    if (user) {
      return db
        .collection(Collections.games)
        .where('players', 'array-contains', user.uid)
        .onSnapshot((querySnapshot) => {
          setGames(
            querySnapshot.docs.map(
              (queryDocSnapshot) =>
                ({
                  id: queryDocSnapshot.id,
                  ...queryDocSnapshot.data(),
                } as Game)
            )
          );
        });
    }
  }, [user, setGames]);

  return games;
}
