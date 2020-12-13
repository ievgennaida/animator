import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NumericComponent } from './numeric.component';

describe('NumericComponent', () => {
  let component: NumericComponent;
  let fixture: ComponentFixture<NumericComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NumericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
