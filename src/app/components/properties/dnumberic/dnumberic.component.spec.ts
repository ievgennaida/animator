import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DnumbericComponent } from './dnumberic.component';

describe('DnumbericComponent', () => {
  let component: DnumbericComponent;
  let fixture: ComponentFixture<DnumbericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DnumbericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DnumbericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
