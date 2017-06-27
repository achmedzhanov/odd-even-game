import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GameStates, StartingGameState} from '../game.model';
import { GameService } from '../game.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil'

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  gameState: StartingGameState /* PlayingGameState */ = null;

  GameStates = GameStates;

  nickname: string = null;

  private _componentDestroyed: Subject<boolean> = new Subject();

  constructor(private _route: ActivatedRoute, private _gameService: GameService, private _router: Router) { }

  async cancel() {
    if (this.gameState) {
      await this._gameService.leaveGame(this.gameState.id);
      await this._router.navigate(['game-list']);
    }
  }

  async ngOnInit() {
    const gameId = this._route.snapshot.params['id'];
    this._gameService.getStartingGameState(gameId)
      .takeUntil(this._componentDestroyed)
      .subscribe((v) => this.gameState = v);
  }

  ngOnDestroy() {
    this._componentDestroyed.next(true);
    this._componentDestroyed.complete();
  }

}
