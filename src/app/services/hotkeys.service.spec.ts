import { TestBed } from '@angular/core/testing';

import { HotkeysService } from './hotkeys.service';

describe('HotkeysService', () => {
  let service: HotkeysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotkeysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
