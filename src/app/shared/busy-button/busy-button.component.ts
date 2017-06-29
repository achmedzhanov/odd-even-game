import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-busy-button',
  templateUrl: './busy-button.component.html',
  styleUrls: ['./busy-button.component.css']
})
export class BusyButtonComponent implements OnInit {

  @Input()
  busy = false;

  @Input()
  disabled = false;

  @Output()
  click = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onClick(event: any) {
    if (this.busy) {
      this.click.next(event);
    }
  }

}
