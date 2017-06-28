import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../game.service';

@Component({
  selector: 'app-game-choose-odd-even',
  templateUrl: './game-choose-odd-even.component.html',
  styleUrls: ['./game-choose-odd-even.component.css']
})
export class GameChooseOddEvenComponent implements OnInit {

  busy = false;

  @Input()
  gameId: string;


  constructor(private _gameService: GameService) { }

  ngOnInit() {
  }

  async guess(value: boolean) {

    if (!this.busy) {

      this.busy = true;

      try {

        await this._gameService.guess(this.gameId, value);

      } finally {
        this.busy = false;
      }
    }
  }

}
