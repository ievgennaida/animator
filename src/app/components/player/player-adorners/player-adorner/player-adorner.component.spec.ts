import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAdornerComponent } from './player-adorner.component';

describe('PlayerAdornerComponent', () => {
  let component: PlayerAdornerComponent;
  let fixture: ComponentFixture<PlayerAdornerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerAdornerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerAdornerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
