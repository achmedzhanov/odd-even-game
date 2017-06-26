import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameStates } from '../game.model';
import { GameService } from '../game.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  gameState: any = 1;

  GameStates = GameStates;

  private _componentDestroyed: Subject<boolean> = new Subject();

  constructor(private _route: ActivatedRoute, private _gameService: GameService) { }

  async ngOnInit() {
    const gameId = this._route.snapshot.params['id'];
    this._gameService.getGameState(gameId)
      //.takeUntil(this._componentDestroyed)
      .subscribe((v) => this.gameState = v);
  }

  ngOnDestroy() {
    this._componentDestroyed.next(true);
    this._componentDestroyed.complete();
  }

}
