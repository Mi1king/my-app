import { TestBed } from '@angular/core/testing';

import { MyPositionsService } from './my-positions.service';

describe('MyPositionsService', () => {
  let service: MyPositionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyPositionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
