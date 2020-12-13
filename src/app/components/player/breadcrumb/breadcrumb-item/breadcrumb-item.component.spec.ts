import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BreadcrumbItemComponent } from './breadcrumb-item.component';

describe('BreadcrumbItemComponent', () => {
  let component: BreadcrumbItemComponent;
  let fixture: ComponentFixture<BreadcrumbItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BreadcrumbItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
