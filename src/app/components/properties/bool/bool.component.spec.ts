import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BoolComponent } from './bool.component';

describe('BoolComponent', () => {
  let component: BoolComponent;
  let fixture: ComponentFixture<BoolComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
