import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbericComponent } from './numberic.component';

describe('NumbericComponent', () => {
  let component: NumbericComponent;
  let fixture: ComponentFixture<NumbericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumbericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumbericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
