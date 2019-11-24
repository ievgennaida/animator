import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DnumericComponent } from './dnumeric.component';

describe('DnumericComponent', () => {
  let component: DnumericComponent;
  let fixture: ComponentFixture<DnumericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DnumericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DnumericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
