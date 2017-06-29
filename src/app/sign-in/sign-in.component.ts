import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['../shared/form-screen.css']
})
export class SignInComponent implements OnInit {

  form: FormGroup;
  busy = false;

  constructor(private _fb: FormBuilder, private _gameService: GameService, private _router: Router) { }

  ngOnInit() {
    this.form = this._fb.group({
      nickname: ['', Validators.required]
    })
  }

  async ok() {
    if (this.form.valid && !this.busy) {

      this.busy = true;

      try {

        await this._gameService.signIn(this.form.value.nickname);
        await this._router.navigateByUrl('/');

      } finally {
        this.busy = false;
      }
    }
  }

}
