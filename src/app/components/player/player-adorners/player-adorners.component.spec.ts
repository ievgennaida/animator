import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAdornersComponent } from './player-adorners.component';

describe('PlayerAdornersComponent', () => {
  let component: PlayerAdornersComponent;
  let fixture: ComponentFixture<PlayerAdornersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerAdornersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerAdornersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
