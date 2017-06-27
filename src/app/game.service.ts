import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {GameStates, Player, StartingGameState} from 'app/game.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import {AuthRequiredError} from './auth-required.error';

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

        if (Number(game.numberOfPlayers) === playersKeys.length) {
          game.state = GameStates.Started;
        }
        // todo setup current step
      }

      return game;
    });

    if (result.snapshot) {
      const val = result.snapshot.val();
      console.log('val', val);
      if (val.players && val.players[currentUserUid]) {
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


  private _mapStartingGameState(record: any): StartingGameState {
    return <StartingGameState>{
      id: record.$key,
      state: record.state,
      numberOfPlayers: record.numberOfPlayers,
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
