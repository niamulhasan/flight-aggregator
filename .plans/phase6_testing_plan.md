# Phase 6: Testing Plan

## Description
This phase covers unit tests, integration tests, and test configuration.

## Prerequisites
- [ ] Phase 1-5 completed: All features implemented

## Task Order
Execute tasks in this exact order:
1. Task 6.1: Configure Jest
2. Task 6.2: Write unit tests for domain services
3. Task 6.3: Write unit tests for provider adapters
4. Task 6.4: Write unit tests for use cases
5. Task 6.5: Write integration tests for API endpoints

---

## Task 6.1: Configure Jest

### File Paths
- `flight-search/package.json`
- `flight-search/jest.config.js` (if needed)

### Implementation Steps
1. [ ] Verify Jest is already set up by NestJS (it should be by default)
2. [ ] Update `package.json` scripts:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:cov": "jest --coverage",
       "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
       "test:e2e": "jest --config ./test/jest-e2e.json"
     }
   }
   ```
3. [ ] Create test setup file if needed

### Validation
- [ ] `npm test` runs all tests
- [ ] `npm run test:cov` generates coverage report

---

## Task 6.2: Write unit tests for domain services

### File Paths
- `flight-search/src/domain/services/__tests__/flight-id-generator.service.spec.ts`
- `flight-search/src/domain/services/__tests__/flight-deduplicator.service.spec.ts`

### Implementation Steps
1. [ ] Test flight ID generator:
   ```typescript
   import { Test } from '@nestjs/testing';
   import { FlightIdGeneratorService } from '../flight-id-generator.service';

   describe('FlightIdGeneratorService', () => {
     let service: FlightIdGeneratorService;

     beforeEach(async () => {
       const module = await Test.createTestingModule({
         providers: [FlightIdGeneratorService],
       }).compile();
       service = module.get<FlightIdGeneratorService>(FlightIdGeneratorService);
     });

     it('should be defined', () => {
       expect(service).toBeDefined();
     });

     it('should generate the same ID for the same input', () => {
       const input = { carrier: 'AA', flightNo: 'AA101', depart: '2026-07-01T08:00:00' };
       const id1 = service.generateFlightId(input);
       const id2 = service.generateFlightId(input);
       expect(id1).toEqual(id2);
     });

     it('should generate different IDs for different inputs', () => {
       const input1 = { carrier: 'AA', flightNo: 'AA101', depart: '2026-07-01T08:00:00' };
       const input2 = { carrier: 'AA', flightNo: 'AA102', depart: '2026-07-01T08:00:00' };
       const id1 = service.generateFlightId(input1);
       const id2 = service.generateFlightId(input2);
       expect(id1).not.toEqual(id2);
     });
   });
   ```

2. [ ] Test deduplicator:
   ```typescript
   import { Test } from '@nestjs/testing';
   import { FlightDeduplicatorService } from '../flight-deduplicator.service';
   import { Flight } from '../../entities/flight';

   describe('FlightDeduplicatorService', () => {
     let service: FlightDeduplicatorService;

     beforeEach(async () => {
       const module = await Test.createTestingModule({
         providers: [FlightDeduplicatorService],
       }).compile();
       service = module.get<FlightDeduplicatorService>(FlightDeduplicatorService);
     });

     it('should be defined', () => {
       expect(service).toBeDefined();
     });

     it('should keep flight with lowest price when deduplicating', () => {
       const flight1 = { id: 'id1', price: 300, providers: ['A'] } as Flight;
       const flight2 = { id: 'id1', price: 250, providers: ['B'] } as Flight;
       const result = service.deduplicate([flight1, flight2]);
       expect(result.length).toBe(1);
       expect(result[0].price).toBe(250);
       expect(result[0].providers).toEqual(['A', 'B']);
     });
   });
   ```

### Validation
- [ ] All unit tests pass
- [ ] Coverage for domain services is good

---

## Task 6.3: Write unit tests for provider adapters

### File Paths
- `flight-search/src/infrastructure/providers/__tests__/provider-a.adapter.spec.ts`
- `flight-search/src/infrastructure/providers/__tests__/provider-b.adapter.spec.ts`
- `flight-search/src/infrastructure/providers/__tests__/provider-c.adapter.spec.ts`

### Implementation Steps
1. [ ] Write tests mocking the HttpService
2. [ ] Verify adapters correctly handle provider responses
3. [ ] Verify error handling for failed provider calls

### Validation
- [ ] Adapter tests pass with mocked dependencies

---

## Task 6.4: Write unit tests for use cases

### File Paths
- `flight-search/src/application/use-cases/__tests__/flight-search.service.spec.ts`
- `flight-search/src/application/use-cases/__tests__/booking.service.spec.ts`

### Implementation Steps
1. [ ] Test search service with mocked providers
2. [ ] Test fail-open behavior
3. [ ] Test deduplication and sorting integration
4. [ ] Test booking service with mocked repository

### Validation
- [ ] Use case tests pass with all dependencies mocked

---

## Task 6.5: Write integration tests for API endpoints

### File Paths
- `test/search.e2e-spec.ts`
- `test/booking.e2e-spec.ts`

### Implementation Steps
1. [ ] Set up test module with in-memory database or test container
2. [ ] Test GET /api/flights/search with various parameters
3. [ ] Test POST /api/bookings
4. [ ] Test GET /api/bookings/:reference
5. [ ] Test error cases

### Validation
- [ ] Integration tests pass
- [ ] Test all API endpoints

---

## Success Criteria
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Test coverage is reasonable (aim for 70%+)
- [ ] Tests are fast and reliable