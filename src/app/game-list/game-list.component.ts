import {Component, OnDestroy, OnInit} from '@angular/core';
import {GameService} from '../game.service';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['../shared/form-screen.css']
})
export class GameListComponent implements OnInit, OnDestroy {

  games: any[];

  private _sub: Subscription;

  constructor(private _gameService: GameService, private _router: Router) { }

  async join(gameId: string) {
    const success =  await this._gameService.joinGame(gameId);
    if (success) {
      await this._router.navigate(['game', gameId]);
    }
  }

  ngOnInit() {
    this._sub = this._gameService.getStartingGames(10).subscribe(v => {
      this.games = v
    });
  }

  ngOnDestroy() {
    if (this._sub) {
      this._sub.unsubscribe();
    }
  }
}
