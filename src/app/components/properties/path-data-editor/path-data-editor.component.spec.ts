import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathDataEditorComponent } from './path-data-editor.component';

describe('PathDataEditorComponent', () => {
  let component: PathDataEditorComponent;
  let fixture: ComponentFixture<PathDataEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathDataEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathDataEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
