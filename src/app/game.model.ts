export enum GameStates {
  Created = 0,
  Started = 1,
  Finished = 2,
  Canceled = 3
}

export interface GameState {
  state: GameStates;
}

export interface Player {
  uid: string,
  nickname: string;
}

export interface StartingGameState extends GameState {
  numberOfPlayers: number;
  joinedNumberOfPlayers: number;
  id: string;
  creator: Player;
  players: Player[];
  canCancel: boolean;
}

export enum TurnType {
  MakeNumber = 0,
  Guess = 1,
  Wait = 2
}

