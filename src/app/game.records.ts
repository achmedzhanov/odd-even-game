import {GameStatus, Player, TurnType} from './game.model';

export interface RecordTurn {
  turn?: {
    playerKey: string,
    turnType: TurnType
  },
  roundIdx?: number
}

export interface RecordSecretNumber {
  secretNumber?: number;
}

export interface RecordScores {
  scores?: {[key: string]: number};
}

export interface RecordPlayers {
  players: {[key: string]: string},
  winner: Player;
}

export interface RecordPlayingGameState extends RecordTurn, RecordSecretNumber, RecordScores, RecordPlayers {
  state: GameStatus;
}
