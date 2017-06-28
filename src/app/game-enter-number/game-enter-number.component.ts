import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GameService} from '../game.service';

@Component({
  selector: 'app-game-enter-number',
  templateUrl: './game-enter-number.component.html',
  styleUrls: ['./game-enter-number.component.css']
})
export class GameEnterNumberComponent implements OnInit {

  form: FormGroup;

  busy = false;

  @Input()
  gameId: string;

  constructor(private _fb: FormBuilder, private _gameService: GameService) { }

  ngOnInit() {

    this.form = this._fb.group({
      number: [null, [Validators.required, Validators.min(1)] ]
    })
  }


  async ok() {
    if (this.form.valid && !this.busy) {

      this.busy = true;

      try {

        await this._gameService.makeNumber(this.gameId, Number(this.form.value.number));

      } finally {
        this.busy = false;
      }
    }
  }

}
