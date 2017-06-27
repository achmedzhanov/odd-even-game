import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGameComponent } from './game-create.component';

describe('CreateGameComponent', () => {
  let component: CreateGameComponent;
  let fixture: ComponentFixture<CreateGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
