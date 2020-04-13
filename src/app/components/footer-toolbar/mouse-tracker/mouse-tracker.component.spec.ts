import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MouseTrackerComponent } from './mouse-tracker.component';

describe('MouseTrackerComponent', () => {
  let component: MouseTrackerComponent;
  let fixture: ComponentFixture<MouseTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MouseTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MouseTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
