import { useState, useEffect } from 'react';
import { GameRequest, User, GameStatus, Game, Round } from '../types';
import firebase from './init';
import {
  queryGameRequest,
  getUser,
  queryGames,
  subscribeToRound,
  subscribeToGameRounds,
} from './selectors';

export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          setUser(user as User);
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

export function useGameRequests(): [GameRequest[], GameRequest[]] {
  const user = useCurrentUser();
  const [sentGameRequests, setSentGameRequests] = useState<GameRequest[]>([]);
  const [receivedGameRequests, setReceivedGameRequests] = useState<
    GameRequest[]
  >([]);

  useEffect(() => {
    if (user) {
      return queryGameRequest('from', user.uid, setSentGameRequests);
    }
  }, [setSentGameRequests, user]);

  useEffect(() => {
    if (user) {
      return queryGameRequest('to', user.uid, setReceivedGameRequests);
    }
  }, [setReceivedGameRequests, user]);

  return [sentGameRequests, receivedGameRequests];
}

export function useUser(uid: string | null): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      if (uid) {
        setUser(await getUser(uid));
      }
    })();
  }, [uid, setUser]);

  return user;
}

function useGames(status: GameStatus) {
  const [games, setGames] = useState<Game[]>([]);
  const user = useCurrentUser();

  useEffect(() => {
    if (user) {
      return queryGames(user.uid, status, setGames);
    }
  }, [user, setGames, status]);

  return games;
}

export function useCurrentGames(): Game[] {
  return useGames(GameStatus.ongoing);
}

export function usePreviousGames(): Game[] {
  return useGames(GameStatus.ended);
}

export function useCurrentRound(game: Game) {
  const [round, setRound] = useState<Round | null>(null);
  const currentRoundId = game.rounds[game.rounds.length - 1];
  useEffect(() => subscribeToRound(currentRoundId, setRound), [
    currentRoundId,
    setRound,
  ]);
  return round;
}

export function useGameRounds(game: Game) {
  const [rounds, setRounds] = useState<Round[] | null>(null);
  useEffect(() => subscribeToGameRounds(game, setRounds), [game, setRounds]);
  return rounds;
}
