import {Component, OnInit} from '@angular/core';
import {GameService} from './game.service';
import {Player} from './game.model';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  viewProviders: [GameService]
})
export class AppComponent implements OnInit {

  initialized = false;

  currentPlayer: Observable<Player>;

  constructor(private _gameService: GameService) {
    this.currentPlayer = this._gameService.currentPlayer;
  }

  async ngOnInit() {
    await this._gameService.init();
    this.initialized = true;
  }
}
