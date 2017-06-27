export enum GameStates {
  Created = 0,
  Started = 1,
  Finished = 2,
  Canceled = 3
}

export interface Player {
  uid: string,
  nickname: string;
}

export interface StartingGameState {
  state: GameStates;
  numberOfPlayers: number;
  id: string;
  creator: Player;
  players: Player[];
  canCancel: boolean;
}
