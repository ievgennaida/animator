import { TestBed } from '@angular/core/testing';

import { UndoService } from './undo.service';

describe('UndoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UndoService = TestBed.get(UndoService);
    expect(service).toBeTruthy();
  });
});
