import * as functions from 'firebase-functions';

import * as db from './db';
import { GameStatus } from '../../src/app/game.model';


// When a new guessed noun is written to the Firebase Realtime Database (either
// from the 'analyzeSpeech' function or directly by the user's app when) we'll
// do the actual scorekeeping in this function.
exports.createGame = functions.database.ref(
  '/requests/create-game/{userId}/{gameId}').onWrite(async event => {

    if (!event.data.current.val()) {
      return;
    }

    const numberOfPlayers = event.data.current.val().numberOfPlayers;
    const userId = event.params.userId;
    const gameId = event.params.gameId;

    try {

      const nickname = await db.get(/users/ + userId + '/nickname');

      await db.transaction('/games/' + gameId, (game: any) => {

        if (game !== null) {
          return game;
        }

        const players = {};
        players[userId] = nickname;

        return {
          numberOfPlayers: numberOfPlayers,
          creator: {
            uid: userId,
            nickname: nickname
          },
          players: players,
          state: GameStatus.Created
        };

      });


      await db.set('/responses/create-game/' + userId + '/' + gameId, gameId);

    } catch (err) {
       console.error('Error while create game: ' + err);
    }
});

