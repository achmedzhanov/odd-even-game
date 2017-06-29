import * as functions from 'firebase-functions';

import * as db from './db';
import {checkPathSymbols, GameActionsService} from './game-actions';


class Request {

  readonly id: string;
  readonly userId: string;
  readonly value: any;

  get resolved(): boolean {
    return this._resolved;
  }

  get resolveValue(): any {
    return this._resolveValue;
  }

  private _resolved = false;
  private _resolveValue: any = null;

  constructor(id: string, userId: string, value: any) {
    this.id = id;
    this.userId = userId;
    this.value = value;
  }

  resolve(value?: any) {
    if (this._resolved) {
      throw new Error('request already resolved');
    }
    this._resolved = true;
    this._resolveValue = value;
  }

}

type RequestHandler = (ga: GameActionsService, request: Request,
                       event: functions.Event<functions.database.DeltaSnapshot> ) => PromiseLike<any> | any;

function handleRequest(requestName: string, handler: RequestHandler ): functions.CloudFunction<functions.database.DeltaSnapshot> {
  return functions.database.ref(
    `/requests/${requestName}/{userId}/{requestId}`).onWrite(async event => {

    if (!event.data.current.val()) {
      return;
    }

    const value = event.data.current.val();
    const userId = event.params.userId;
    const requestId = event.params.requestId;

    try {

    const request = new Request(requestId, userId, value);
    const ga = new GameActionsService(userId);
    let result = handler(ga, request, event);
    if (result && result.then) {
      result = await <Promise<any>>result;
    }

    let responseValue = true;
    if (result !== null && result !== undefined) {
      responseValue = result;
    }

    if (request.resolved && request.resolveValue !== null && request.resolveValue !== undefined) {
      responseValue = request.resolveValue;
    }

    await db.set(`/responses/${requestName}/${userId}/${requestId}`, responseValue);
    // TODO return error code to response when exception

    } catch (err) {
      console.error('Error while process response: ' + `/requests/${requestName}/{userId}/{requestId}`);
    }

  });
}

exports.createGame = handleRequest('create-game', async (gameActions, request, event) => {
  const numberOfPlayers =  request.value.numberOfPlayers;
  return await gameActions.createGame(numberOfPlayers || 2);
});

exports.joinGame = handleRequest('join-game', async (gameActions, request, event) => {
  const gameId =  request.value.gameId;
  checkPathSymbols(gameId);
  return await gameActions.joinGame(gameId);
});

exports.leaveGame = handleRequest('leave-game', async (gameActions, request, event) => {
  const gameId =  request.value.gameId;
  checkPathSymbols(gameId);
  return await gameActions.leaveGame(gameId);
});

exports.makeNumber = handleRequest('make-number', async (gameActions, request, event) => {
  const gameId =  request.value.gameId;
  checkPathSymbols(gameId);
  const value =  request.value.value;
  checkPathSymbols(value);

  return await gameActions.makeNumber(gameId, value);
});

exports.guess = handleRequest('guess', async (gameActions, request, event) => {
  const gameId =  request.value.gameId;
  checkPathSymbols(gameId);
  const isEven =  request.value.isEven;
  checkPathSymbols(isEven);

  return await gameActions.guess(gameId, isEven);
});
