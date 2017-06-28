import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameEnterNumberComponent } from './game-enter-number.component';

describe('GameEnterNumberComponent', () => {
  let component: GameEnterNumberComponent;
  let fixture: ComponentFixture<GameEnterNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameEnterNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameEnterNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
