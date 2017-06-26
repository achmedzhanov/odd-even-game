import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GameService} from '../game.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.component.html',
  styleUrls: ['../shared/form-screen.css']
})
export class CreateGameComponent implements OnInit {
  form: FormGroup;
  busy = false;

  constructor(private _fb: FormBuilder, private _gameService: GameService, private _router: Router) { }

  ngOnInit() {

    if (!this._gameService.nickname) {
      this._router.navigate(['enter-name']);
    }

    this.form = this._fb.group({
      numberOfPlayers: ['2', [Validators.required, Validators.min(2)] ]
    })
  }

  async ok() {
    if (this.form.valid && !this.busy) {

      this.busy = true;

      try {

        const gameId = await this._gameService.createGame({nickname: this._gameService.nickname, numberOfPlayers: this.form.value.numberOfPlayers});
        await this._router.navigate(['game', gameId]);

      } finally {
        this.busy = false;
      }
    }
  }
}
