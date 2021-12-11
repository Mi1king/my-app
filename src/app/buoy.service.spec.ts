import { TestBed } from '@angular/core/testing';

import { BuoyService } from './buoy.service';

describe('BuoyService', () => {
  let service: BuoyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuoyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
