import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { GameStates } from 'app/game.model';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GameService {

  private _user: firebase.User;

  private _nickname: string;

  constructor(private _db: AngularFireDatabase, private _fa: AngularFireAuth) { }

  async signIn(name: string): Promise<void> {
    await this._fa.auth.signInAnonymously()
    this._user = this._fa.auth.currentUser;
    this._nickname = name;
  }

  get nickname(): string {
    return this._nickname;
  }

  async createGame(params: { nickname: string, numberOfPlayers: number }): Promise<string> {
    this._checkAuth();

    const newData = await this._db.database.ref('/games').push();
    // todo get current user uid
    const uid = this._user.uid;
    await newData.update({
      numberOfPlayers: params.numberOfPlayers,
      creator: {
        uid: uid,
        nickname: params.nickname
      },
      players: {
        uid: params.nickname
      },
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
    // return this._db.database.ref('/games/' + gameId).on('value');
  }

  async joinGame(gameId: string): Promise<boolean> {
    this._checkAuth();

    throw new Error('not implemented');
  }

  async getStartingGames(max: number) {
    this._checkAuth();

    throw new Error('not implemented');
  }

  private _checkAuth() {
    if (!this._user) {
      // todo
      // throw new AuthRequiredError();
    }
  }
}
