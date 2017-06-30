import {GameStatus, Player, TurnType} from '../../src/app/game.model';
import {RecordPlayingGameState, RecordTurn} from '../../src/app/game.records';

import * as db from './db';

function isNullOrUndefined(v: any) {
  return v === null || v === undefined;
}

export function checkPathSymbols(value: string | any) {
  if (!value) {
    return;
  }
  if (typeof value === 'string' && value.indexOf('/') !== -1) {
    throw new Error('unexpected symbol');
  }
}

export class GameActionsService {

  readonly defaultNumberOfRounds = 5; // todo get this value from database

  constructor(private _currentUserUid: string) {}

  async createGame(numberOfPlayers: number) {

    const nickname = await this._nickname();

    const newRecord = db.push('/games/');
    const gameId = newRecord.key;

    await db.transaction('/games/' + gameId, (game: any) => {

      if (game !== null) {
        return game;
      }

      const players = {};
      players[this._currentUserUid] = nickname;

      return {
        numberOfPlayers: numberOfPlayers,
        creator: {
          uid: this._currentUserUid,
          nickname: nickname
        },
        players: players,
        state: GameStatus.Created
      };

    });

    return gameId;
  }

  async joinGame(gameId: string): Promise<boolean> {

    if (!gameId) {
      throw new Error('expected not empty gameId');
    }

    const currentNickname = await await this._nickname();;

    const result = await db.transaction('/games/' + gameId, (game) => {
      if (!game) {
        return game;
      }

      const playersKeys = Object.keys(game.players);

      if (Number(game.numberOfPlayers) > playersKeys.length && playersKeys.indexOf(this._currentUserUid) === -1) {
        game.players[this._currentUserUid] = currentNickname;

        if (Number(game.numberOfPlayers) === Object.keys(game.players).length) {
          this._startGame(game);
        }
      }

      return game;
    });

    if (result.snapshot) {
      const value = result.snapshot.val();

      if (value.players && value.players[this._currentUserUid]) {
        return true;
      }
    }

    return false;
  }

  async leaveGame(gameId: string) {

    if (!gameId) {
      throw new Error('expected not empty gameId');
    }

    await db.transaction('/games/' + gameId, (game) => {
      if (!game) {
        return game;
      }

      if (game.state === GameStatus.Created) {
        if (game.creator.uid === this._currentUserUid) {
          game.state = GameStatus.Canceled;
        } else {
          game.players[this._currentUserUid] = null;
        }
      } else if (game.state === GameStatus.Created) {
        // todo
        // mark user as removed
        // stop game if less then 2 players
      }

      return game;
    });
  }

  async guess(gameId: string, isEven: boolean): Promise<boolean> {

    if (!gameId) {
      throw new Error('expected not empty gameId');
    }

    if (isNullOrUndefined(isEven)) {
      throw new Error('expected not empty isEven');
    }

    const currentScore = await db.get(`/games/${gameId}`) || 0;

    const secretNumber = Number(await db.get(`/games-secret-number/${gameId}`));

    const result = await db.transaction('/games/' + gameId, (game: RecordPlayingGameState) => {
      if (!game) {
        return game;
      }

      if (game.state !== GameStatus.Started ) {
        return game;
      }

      if (!(game.turn && game.turn.playerKey === this._currentUserUid && game.turn.turnType === TurnType.Guess)) {
        return game;
      }

      const actualIsEven = (secretNumber % 2) === 0;

      if (actualIsEven === isEven) {
        const scores = game.scores || {};
        const score = scores[this._currentUserUid] || 0;
        scores[this._currentUserUid] = score + 1;
        game.scores = scores;
      }

      this._nextTurn(<any>game);
      this._checkFinished(game);

      return game;
    });

    const newScore = await db.get(`/games/${gameId}`) || 0;

    return newScore > currentScore;
  }

  async makeNumber(gameId: string, value: number): Promise<void> {

    if (!gameId) {
      throw new Error('expected not empty gameId');
    }

    if (isNullOrUndefined(value)) {
      throw new Error('expected not empty value');
    }

    const turn = await db.get(`/games/${gameId}/turn`);
    if (!(turn && turn.playerKey === this._currentUserUid && turn.turnType === TurnType.MakeNumber)) {
      console.error('turn', turn);
      return;
    }

    await db.set(`/games-secret-number/${gameId}`, value);

    await db.transaction(`/games/${gameId}`, (game: RecordPlayingGameState) => {
      if (!game) {
        return game;
      }

      if (game.state !== GameStatus.Started ) {
        return game;
      }

      if (!(game.turn && game.turn.playerKey === this._currentUserUid && game.turn.turnType === TurnType.MakeNumber)) {
        return game;
      }

      this._nextTurn(<any>game);

      return game;
    });
  }

  private _startGame(game: any) {
    game.state = GameStatus.Started;
    game.numberOfRounds = this.defaultNumberOfRounds; // TODO get from db
    this._nextTurn(game);
  }

  private _nextTurn(game: {roundIdx?: number, turn?: {playerKey: string, turnType: TurnType}, scores?: {}, players: {}}) {

    // todo filter handle leaved players
    const playersKeys = Object.keys(game.players);
    if (playersKeys.length < 2) {
      throw new Error('Ожидается количество игроков не менее 2-х');
    }

    if (isNullOrUndefined(game.turn) || isNullOrUndefined(game.roundIdx)) {
      game.roundIdx = 0;
      game.turn = {
        playerKey: playersKeys[0],
        turnType: TurnType.MakeNumber
      };

      const scores = {};
      for (let k of playersKeys) {
        scores[k] = 0;
      }
      game.scores = scores;

    } else {
      const idx = playersKeys.indexOf(game.turn.playerKey);
      if (idx === -1) {
        throw new Error('Неверный turnKey');
      }

      if (game.turn.turnType === TurnType.Guess) {
        game.turn.turnType = TurnType.MakeNumber;
      } else {
        if (idx < playersKeys.length - 1) {
          game.turn = {
            playerKey: playersKeys[idx + 1],
            turnType: TurnType.Guess
          };
        } else {
          game.turn = {
            playerKey: playersKeys[0],
            turnType: TurnType.Guess
          };
          game.roundIdx += 1;
        }
      }
    }
  }

  private _checkFinished(game: RecordPlayingGameState) {
    const numberOfRounds = (<any>game).numberOfRounds || this.defaultNumberOfRounds;

    if (game.roundIdx < numberOfRounds) {
      return;
    }

    const playerIdx = Object.keys(game.players).indexOf(game.turn.playerKey);
    if (playerIdx === -1) {
      throw new Error('invalid game state');
    }

    if (game.roundIdx === numberOfRounds && playerIdx === 0 && game.turn.turnType === TurnType.Guess) {
      return;
    }

    const sortedScores =  Object.keys(game.scores)
      .map((k) => {
        return {playerKey: k, score: game.scores[k]};
      }).sort((a, b) => b.score - a.score);

    const nofirst = !(sortedScores[0].score > sortedScores[1].score);

    if (nofirst) {
      return;
    }

    game.state = GameStatus.Finished;
    const winnerKey = sortedScores[0].playerKey;
    const winnerNickname = game.players[winnerKey];
    game.winner = {
      uid: winnerKey,
      nickname: game.players[winnerKey]
    }
  }

  private async _nickname(): Promise<string> {
    return await db.get(/users/ + this._currentUserUid + '/nickname') || this._currentUserUid;
  }

}
