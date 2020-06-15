import firebase, { db } from './init';
import {
  Collections,
  GameRequest,
  Game,
  Round,
  User,
  GameStatus,
} from '../types';

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

export function queryGameRequest(
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

export async function getUser(uid: string): Promise<User> {
  const doc = await db.collection(Collections.users).doc(uid).get();
  return doc.data() as User;
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

export function queryGames(
  uid: string,
  status: GameStatus,
  setter: (value: Game[]) => void
) {
  return db
    .collection(Collections.games)
    .where('players', 'array-contains', uid)
    .where('status', '==', status)
    .onSnapshot((querySnapshot) => {
      setter(
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

async function getRound(roundId: string) {
  const docSnapshot = await db
    .collection(Collections.rounds)
    .doc(roundId)
    .get();
  return { id: docSnapshot.id, ...docSnapshot.data() } as Round;
}

export async function getRounds(game: Game): Promise<Round[]> {
  return Promise.all(game.rounds.map(getRound));
}

export function subscribeToRound(roundId:string, setter:(value: Round) => void) {
  return db.collection(Collections.rounds).doc(roundId).onSnapshot(doc => {
    setter({ id: doc.id, ...doc.data() } as Round);
  });
}

export function subscribeToGameRounds(game: Game, setter: (value: Round[]) => void) {
  return db
    .collection(Collections.rounds)
    .where(firebase.firestore.FieldPath.documentId(), 'in', game.rounds)
    .onSnapshot(querySnapshot => {
      setter(
        querySnapshot.docs.map(
          queryDocSnapshot => ({ id: queryDocSnapshot.id, ...queryDocSnapshot.data() } as Round)
        )
      );
    });
}
