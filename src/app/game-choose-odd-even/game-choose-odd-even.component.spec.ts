import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameChooseOddEvenComponent } from './game-choose-odd-even.component';

describe('GameChooseOddEvenComponent', () => {
  let component: GameChooseOddEvenComponent;
  let fixture: ComponentFixture<GameChooseOddEvenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameChooseOddEvenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameChooseOddEvenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
