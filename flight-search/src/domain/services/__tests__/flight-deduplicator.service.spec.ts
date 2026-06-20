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
    const flight1 = {
      id: 'id1',
      price: 300,
      providers: ['A'],
      carrier: 'AA',
      flightNo: 'AA101',
      from: 'DAC',
      to: 'DXB',
      depart: new Date('2026-07-01T08:00:00'),
      arrive: new Date('2026-07-01T12:30:00'),
      stops: 0,
      currency: 'USD',
      providerData: {},
      getDuration: () => 270,
      isSameFlight: () => true,
    } as Flight;

    const flight2 = {
      id: 'id1',
      price: 250,
      providers: ['B'],
      carrier: 'AA',
      flightNo: 'AA101',
      from: 'DAC',
      to: 'DXB',
      depart: new Date('2026-07-01T08:00:00'),
      arrive: new Date('2026-07-01T12:30:00'),
      stops: 0,
      currency: 'USD',
      providerData: {},
      getDuration: () => 270,
      isSameFlight: () => true,
    } as Flight;

    const result = service.deduplicate([flight1, flight2]);
    expect(result.length).toBe(1);
    expect(result[0].price).toBe(250);
    expect(result[0].providers).toEqual(['A', 'B']);
  });
});
