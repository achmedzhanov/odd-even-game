import { Component, OnInit } from '@angular/core';
import {GameService} from '../game.service';
import {Router} from '@angular/router';
import {AsyncBusy} from '../shared/busy.mixin';

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.css', '../shared/form-screen.css']
})
export class GameMenuComponent extends AsyncBusy implements OnInit {

  constructor(private _gameService: GameService, private _router: Router) { super(); }

  ngOnInit() {
    if (!this._gameService.nickname) {
      this._router.navigate(['sign-in']);
    }
  }

  play() {
    this.withBusy(this.selectGame());
  }

  async selectGame(): Promise<void> {
    while (true) {
      const games = await this._gameService.getStartingGames(10).first(v => v != null).toPromise();
      if (games.length === 0) {
        await this._router.navigate(['create-game']);
        break;
      } else {
        const game = games[0];
        const success = await this._gameService.joinGame(game.id);
        if (success) {
          await this._router.navigate(['game', game.id]);
          break;
        }
      }
    }
  }


}
