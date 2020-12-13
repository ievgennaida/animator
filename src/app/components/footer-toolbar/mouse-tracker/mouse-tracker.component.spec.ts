import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MouseTrackerComponent } from './mouse-tracker.component';

describe('MouseTrackerComponent', () => {
  let component: MouseTrackerComponent;
  let fixture: ComponentFixture<MouseTrackerComponent>;

  beforeEach(waitForAsync(() => {
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
