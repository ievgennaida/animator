import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlineNodeComponent } from './outline-node.component';

describe('OutlineNodeComponent', () => {
  let component: OutlineNodeComponent;
  let fixture: ComponentFixture<OutlineNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutlineNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutlineNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
