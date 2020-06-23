import shuffle from 'shuffle-array';
import { advanceTo, clear } from 'jest-date-mock';
import {
  Collections,
  GameRequestStatus,
  Suit,
  Phase,
  GameStatus,
} from '../types';
import { ORDERED_DECK, HAND_SIZE } from '../constants';
import firebase, { db } from './init';
import {
  addUserToFirestore,
  createGameRequest,
  removeRequest,
  createGame,
} from './actions';
import { mockDeck } from './test-data';

jest.mock('./init');
jest.mock('shuffle-array');

describe('Firebase Actions', () => {
  it('addUserToFirestore', () => {
    const mockDoc = jest.fn();
    const mockSet = jest.fn();
    mockDoc.mockReturnValue({ set: mockSet });
    db.collection.mockReturnValue({ doc: mockDoc });

    const testUid = 'id';
    const testDisplayName = 'Joon Park';
    const testEmail = 'joon@example.com';
    const testPhotoURL = 'something';
    const user = {
      displayName: testDisplayName,
      email: testEmail,
      photoURL: testPhotoURL,
      uid: testUid,
    };
    addUserToFirestore(user);

    expect(db.collection).toHaveBeenCalledWith(Collections.users);
    expect(mockDoc).toHaveBeenCalledWith(testUid);
    expect(mockSet).toHaveBeenCalledWith({
      displayName: testDisplayName,
      email: testEmail,
      photoURL: testPhotoURL,
      uid: testUid,
    });
  });

  it('createGameRequest', () => {
    const mockAdd = jest.fn();
    db.collection.mockReturnValue({ add: mockAdd });

    const testRecipientUid = 'something1';
    const testSenderUid = 'something2';
    createGameRequest(testRecipientUid, testSenderUid);
    expect(db.collection).toHaveBeenCalledWith(Collections.requests);
    expect(mockAdd).toHaveBeenCalledWith({
      from: testSenderUid,
      to: testRecipientUid,
      status: GameRequestStatus.pending,
    });
  });

  it('removeRequest', () => {
    const mockDoc = jest.fn();
    const mockDelete = jest.fn();
    mockDoc.mockReturnValue({ delete: mockDelete });
    db.collection.mockReturnValue({ doc: mockDoc });

    const testId = 'id';
    const testGameRequest = {
      id: testId,
      from: 'Eric Whitacre',
      to: 'John Mackey',
      status: GameRequestStatus.pending,
    };
    removeRequest(testGameRequest);

    expect(db.collection).toHaveBeenCalledWith(Collections.requests);
    expect(mockDoc).toHaveBeenCalledWith(testId);
    expect(mockDelete).toHaveBeenCalled();
  });

  it('createGame', async () => {
    const mockAdd = jest.fn();
    const mockDoc = jest.fn();
    const mockDelete = jest.fn();
    mockDoc.mockReturnValue({ delete: mockDelete });
    const docRefId = 'docRefId';
    mockAdd.mockReturnValue({ id: docRefId });
    db.collection.mockReturnValue({ add: mockAdd, doc: mockDoc });
    shuffle.mockReturnValue(mockDeck);

    const now = new Date();
    advanceTo(now);
    const timestamp = 12345678;
    firebase.firestore.Timestamp.fromDate.mockReturnValue(timestamp);

    const fromPlayer = 'uid1';
    const toPlayer = 'uid2';
    const gameRequestId = 'id';
    const gameRequest = {
      id: gameRequestId,
      from: fromPlayer,
      to: toPlayer,
      status: GameRequestStatus.pending,
    };
    await createGame(gameRequest);

    expect(db.collection.mock.calls[0][0]).toBe(Collections.rounds);
    expect(shuffle).toHaveBeenCalledWith(ORDERED_DECK, { copy: true });
    expect(mockAdd.mock.calls[0][0]).toEqual({
      playerCards: {
        [fromPlayer]: {
          hand: mockDeck.slice(0, HAND_SIZE),
        },
        [toPlayer]: {
          hand: mockDeck.slice(HAND_SIZE, HAND_SIZE * 2),
        },
      },
      discard: [mockDeck[HAND_SIZE * 2]],
      deck: mockDeck.slice(HAND_SIZE * 2 + 1),
      turn: {
        player: fromPlayer,
        phase: Phase.startPhase,
        mustPlayCard: null,
      },
      table: {},
      startTime: timestamp,
    });

    expect(db.collection.mock.calls[1][0]).toBe(Collections.requests);
    expect(mockDoc).toHaveBeenCalledWith(gameRequestId);
    expect(mockDelete).toHaveBeenCalled();

    expect(db.collection.mock.calls[2][0]).toBe(Collections.games);
    expect(firebase.firestore.Timestamp.fromDate).toHaveBeenCalledWith(now);
    expect(mockAdd.mock.calls[1][0]).toEqual({
      players: [fromPlayer, toPlayer],
      rounds: [docRefId],
      status: GameStatus.ongoing,
      startTime: timestamp,
    });

    clear();
  });
});
