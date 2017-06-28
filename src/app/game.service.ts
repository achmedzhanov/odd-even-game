import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {
  GameState, GameStates, Player, StartingGameState,
  TurnType
} from 'app/game.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import {AuthRequiredError} from './auth-required.error';
import {isNullOrUndefined} from 'util';

interface GameTurn {
  turn?: {
    playerKey: string,
    turnType: TurnType
  }
}

interface GameNumber {
  number?: number;
}

interface GameScores {
  scores?: {};
}

@Injectable()
export class GameService {

  private _user: firebase.User = null;

  private _nickname: string = undefined;

  get currentPlayer(): Observable<Player> {
    return this._currentPlayer;
  }
  private _currentPlayer = new BehaviorSubject<Player>(null);

  constructor(private _db: AngularFireDatabase, private _fa: AngularFireAuth) {
    this._fa.auth.onAuthStateChanged((v) => {
      console.log('on auth state changed', v); // todo update user context
    });
  }

  async init() {
    await this.trySignIn();
  }

  async signIn(name: string): Promise<void> {
    await this._fa.auth.signInAnonymously();
    this._user = this._fa.auth.currentUser;
    await this._db.database.ref(/users/ + this._user.uid + '/nickname').set(name);
    this._nickname = name;
    this._currentPlayer.next({uid: this._user.uid, nickname: this._nickname});
  }

  async trySignIn(): Promise<void> {
    await this._fa.auth.signInAnonymously()
    this._user = this._fa.auth.currentUser;
    const storedNickname = await this._db.database.ref(/users/ + this._user.uid + '/nickname').once('value');
    this._nickname = storedNickname.val();
    if (this._nickname) {
      this._currentPlayer.next({uid: this._user.uid, nickname: this._nickname});
    }
  }

  get nickname(): string {
    return this._nickname;
  }

  async createGame(params: { nickname: string, numberOfPlayers: number }): Promise<string> {
    this._checkAuth();

    const newData = await this._db.database.ref('/games').push();
    // todo get current user uid
    const uid = this._user.uid;
    const players = { };
    players[uid] = params.nickname;
    await newData.update({
      numberOfPlayers: params.numberOfPlayers,
      creator: {
        uid: uid,
        nickname: params.nickname
      },
      players: players,
      state: GameStates.Created
    });

    return newData.key;
  }

  async getGame(gameId: string): Promise<any> {
    this._checkAuth();

    const data = await this._db.database.ref('/games/' + gameId).once('value');
    const game = data.val()
    return game;
  }

  getGameState(gameId: string): Observable</*{state: GameState}*/any> {
    this._checkAuth();

    return this._db.object('/games/' + gameId, { preserveSnapshot: true }).map((v) => v.val());
  }

  getStartingGameState(gameId: string): Observable<StartingGameState> {
    this._checkAuth();

    return this._db.object('/games/' + gameId, { preserveSnapshot: false }).map((v) => this._mapStartingGameState(v));
  }

  async joinGame(gameId: string): Promise<boolean> {
    this._checkAuth();

    const currentUserUid = this._user.uid;

    const result = await this._db.database.ref('/games/' + gameId).transaction((game) => {
      if (!game) {
        return game;
      }

      const playersKeys = Object.keys(game.players);
      if (Number(game.numberOfPlayers) > playersKeys.length && !playersKeys.includes(currentUserUid)) {
        game.players[currentUserUid] = this._nickname;

        if (Number(game.numberOfPlayers) === Object.keys(game.players).length) {
          this._startGame(game);
        }
      }

      return game;
    });

    if (result.snapshot) {
      const value = result.snapshot.val();
      console.log('val', value);
      if (value.players && value.players[currentUserUid]) {
        return true;
      }
    }

    return false;
  }

  async leaveGame(gameId: string) {
    this._checkAuth();

    const currentUserUid = this._user.uid;

    await this._db.database.ref('/games/' + gameId).transaction((game) => {
      if (!game) {
        return game;
      }

      if (game.state === GameStates.Created) {
        if (game.creator.uid === currentUserUid) {
          game.state = GameStates.Canceled;
        } else {
          game.players[currentUserUid] = null;
        }
      } else if (game.state === GameStates.Created) {
        // todo
        // mark user as removed
        // stop game if less then 2 players
      }

      return game;
    });
  }

  getStartingGames(max: number): Observable<StartingGameState[]> {
    this._checkAuth();

    return this._db.list('/games', {
      preserveSnapshot: false,
      query: {
        limitToFirst: max,
        orderByChild: 'state',
        equalTo: 0
      }
    }).map(a => a.map(r => this._mapStartingGameState(r)));
  }


  getMyTurns(gameId: string): Observable<TurnType> {
    this._checkAuth();

    return this._db.object('/games/' + gameId + '/turn', { preserveSnapshot: true })
      .map((r: any) => {
        const value = r.val();
        if (!value || value.playerKey !== this._user.uid) {
          return TurnType.Wait;
        }
        return value.turnType;
      })
  }

  async guess(gameId: string, isEven: boolean): Promise<boolean> {
    this._checkAuth();

    const currentUserUid = this._user.uid;

    const result = await this._db.database.ref('/games/' + gameId).transaction((game: GameState & GameTurn & GameNumber & GameScores) => {
      if (!game) {
        return game;
      }

      if (game.state !== GameStates.Started ) {
        return game;
      }

      if (!(game.turn && game.turn.playerKey === currentUserUid && game.turn.turnType === TurnType.Guess)) {
        return game;
      }

      const actualIsEven = (game.number % 2) === 0;

      if (actualIsEven === isEven) {
        const scores = game.scores || {};
        const score = scores[currentUserUid] || 0;
        scores[currentUserUid] = score + 1;
        game.scores = scores;
      }

      this._nextTurn(<any>game);

      return game;
    });

    // TODO scheck score increment
    return false;
  }

  async makeNumber(gameId: string, value: number): Promise<void> {
    this._checkAuth();

    const currentUserUid = this._user.uid;

    const result = await this._db.database.ref('/games/' + gameId).transaction((game: GameState & GameTurn & GameNumber) => {
      if (!game) {
        return game;
      }

      if (game.state !== GameStates.Started ) {
        return game;
      }

      if (!(game.turn && game.turn.playerKey === currentUserUid && game.turn.turnType === TurnType.MakeNumber)) {
        return game;
      }

      game.number = value;

      this._nextTurn(<any>game);

      return game;
    });
  }

  getGameScores(gameId: string): Observable<{player: Player, score: number}[] | null> {
    this._checkAuth();

    // todo get players list once

    return this._db.object('/games/' + gameId + '/scores', { preserveSnapshot: true })
      .map((r) => {
      const value = r.val();
      if (!value) {
        return null;
      }
      return Object.keys(value).map((k) => {
            return {
              player: {
                uid: k,
                nickname: k
              },
              score: value[k]
            }
          });
      });
  }

  private _startGame(game: any) {
    game.state = GameStates.Started;
    game.numberOfrounds = 5; // TODO get from db
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

  private _mapStartingGameState(record: any): StartingGameState {
    return <StartingGameState>{
      id: record.$key,
      state: record.state,
      numberOfPlayers: record.numberOfPlayers,
      joinedNumberOfPlayers: Object.keys(record.players).length,
      creator: {
        uid: record.creator.uid,
        nickname: record.creator.nickname
      },
      players: Object.keys(record.players).map((k) => {
        return {
          uid: k,
          nickname: record.players[k]
        }
      }),
      canCancel: this._user.uid === record.creator.uid
    };
  }

  private _checkAuth() {
    if (!this._user || !this._nickname) {
      throw new AuthRequiredError('required signed user');
    }
  }
}
