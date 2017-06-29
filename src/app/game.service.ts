import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {
  GameStatus, Player, Score, GameState, TurnType
} from 'app/game.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import {AuthRequiredError} from './auth-required.error';
import {isNullOrUndefined} from 'util';
import {RecordPlayingGameState} from './game.records';


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

    const response = await this._sendRequest('create-game', {
      numberOfPlayers: params.numberOfPlayers
    });

    return response;

  }

  async joinGame(gameId: string): Promise<boolean> {
    this._checkAuth();

    const response = await this._sendRequest('join-game', {
      gameId: gameId
    });

    return !!response;
  }

  async leaveGame(gameId: string) {
    this._checkAuth();

    await this._sendRequest('leave-game', {
      gameId: gameId
    });

  }

  async guess(gameId: string, isEven: boolean): Promise<boolean> {
    this._checkAuth();

    const response = await this._sendRequest('guess', {
      gameId: gameId,
      isEven: isEven
    });

    return !!response;
  }

  async makeNumber(gameId: string, value: number): Promise<void> {

    this._checkAuth();

    await this._sendRequest('make-number', {
      gameId: gameId,
      value: value
    });
  }

  getGameState(gameId: string): Observable<GameState> {
    this._checkAuth();

    return this._db.object('/games/' + gameId, { preserveSnapshot: false }).map((v) => this._mapGameState(v));
  }

  getStartingGames(max: number): Observable<GameState[]> {
    this._checkAuth();

    return this._db.list('/games', {
      preserveSnapshot: false,
      query: {
        limitToFirst: max,
        orderByChild: 'state',
        equalTo: 0
      }
    }).map(a => a.map(r => this._mapGameState(r)));
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

  getGameScores(gameId: string): Observable<Score[] | null> {
    this._checkAuth();

    const players$ = this._db.object('/games/' + gameId + '/players', { preserveSnapshot: true })
      .map((r) => {
      const value = r.val();
      return  Object.keys(value || {}).map((k) => {
          return {
            uid: k,
            nickname: value[k]
          }
        })
      });

    const scores$ = this._db.object('/games/' + gameId + '/scores', { preserveSnapshot: true })
      .map((r) => {
        return <{[ket: string]: number} | null>r.val();
      }).filter(v => v !== null);

    return players$.combineLatest(scores$)
      .map((v) => {
        const [players, scores] = v;
        return players.map((p) => {
          return {
            player: p,
            score: scores[p.uid] || 0
          }
        })
      })
  }


  private async _sendRequest(requestName: string, params: any): Promise<any> {
    const uid = this._user.uid;
    const newData = await this._db.database.ref(`/requests/${requestName}/${uid}`).push();
    const newGameKey = newData.key;

    await newData.update(params);

    const response = await this._db.object(`/responses/${requestName}/${uid}/${newGameKey}`, { preserveSnapshot: true })
      .map(v => {
        return v.val();
      }).first(v => v != null)
      .toPromise();

    await this._db.database.ref(`/requests/${requestName}/${uid}/${newGameKey}`).remove();
    await this._db.database.ref(`/responses/${requestName}/${uid}/${newGameKey}`).remove();

    return response;
  }

  private _mapGameState(record: any): GameState {
    return <GameState>{
      id: record.$key,
      status: record.state,
      numberOfPlayers: record.numberOfPlayers,
      joinedNumberOfPlayers: Object.keys(record.players).length,
      creator: {
        uid: record.creator.uid,
        nickname: record.creator.nickname
      },
      winner: record.winner ?  {
        uid: record.winner.uid,
        nickname: record.winner.nickname
      } : null,
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
