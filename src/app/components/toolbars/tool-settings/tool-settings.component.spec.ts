import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolSettingsComponent } from './tool-settings.component';

describe('ToolSettingsComponent', () => {
  let component: ToolSettingsComponent;
  let fixture: ComponentFixture<ToolSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
