import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GameStatus, GameState, TurnType} from '../game.model';
import { GameService } from '../game.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  myTurn: boolean | TurnType;

  TurnType = TurnType;

  scores: any[];

  gameState: GameState /* PlayingGameState */ = null;

  GameStates = GameStatus;

  nickname: string = null;

  private _componentDestroyed: Subject<boolean> = new Subject();

  constructor(private _route: ActivatedRoute, private _gameService: GameService, private _router: Router) { }

  async cancel() {
    if (this.gameState) {
      await this._gameService.leaveGame(this.gameState.id);
      await this._router.navigateByUrl('/');
    }
  }

  async ngOnInit() {
    const gameId = this._route.snapshot.params['id'];
    this._gameService.getStartingGameState(gameId)
      .takeUntil(this._componentDestroyed)
      .subscribe((v) => this.gameState = v);

    this._gameService.getGameScores(gameId)
      .takeUntil(this._componentDestroyed)
      .subscribe((v) => this.scores = v);

    this._gameService.getMyTurns(gameId)
      .takeUntil(this._componentDestroyed)
      .subscribe((v) => this.myTurn = v);
  }

  ngOnDestroy() {
    this._componentDestroyed.next(true);
    this._componentDestroyed.complete();
  }

}
