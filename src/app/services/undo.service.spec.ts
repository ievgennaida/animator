import { TestBed } from '@angular/core/testing';

import { UndoService } from './undo.service';

describe('UndoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UndoService = TestBed.inject(UndoService);
    expect(service).toBeTruthy();
  });
});
