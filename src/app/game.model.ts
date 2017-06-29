export enum GameStatus {
  Created = 0,
  Started = 1,
  Finished = 2,
  Canceled = 3
}

export interface Player {
  uid: string,
  nickname: string;
}

export interface Score {
  player: Player,
  score: number;
}

export interface GameState {
  status: GameStatus;
  numberOfPlayers: number;
  joinedNumberOfPlayers: number;
  id: string;
  creator: Player;
  players: Player[];
  winner?: Player;
  canCancel: boolean;
}

export enum TurnType {
  MakeNumber = 0,
  Guess = 1,
  Wait = 2
}

