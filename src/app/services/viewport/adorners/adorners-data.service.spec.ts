import { TestBed } from '@angular/core/testing';

import { AdornersDataService } from './adorners-data.service';

describe('AdornersDataService', () => {
  let service: AdornersDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdornersDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
