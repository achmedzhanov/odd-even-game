import {Component, OnInit} from '@angular/core';
import {GameService} from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  viewProviders: [GameService]
})
export class AppComponent implements OnInit {
  ngOnInit() {

  }
}
