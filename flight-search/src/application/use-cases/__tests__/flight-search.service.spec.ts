import { Test } from '@nestjs/testing';
import { FlightSearchService } from '../flight-search.service';
import { FlightDeduplicatorService } from '../../../domain/services/flight-deduplicator.service';
import { FlightSorterService } from '../../services/flight-sorter.service';
import { FlightFilterService } from '../../services/flight-filter.service';
import { FlightProvider } from '../../../infrastructure/providers/flight-provider.interface';
import { Flight } from '../../../domain/entities/flight';

const createMockFlight = (
  id: string,
  price: number,
  providerName: string,
): Flight => {
  return {
    id,
    carrier: 'AA',
    flightNo: 'AA101',
    from: 'DAC',
    to: 'DXB',
    depart: new Date('2026-07-01T08:00:00'),
    arrive: new Date('2026-07-01T12:30:00'),
    stops: 0,
    price,
    currency: 'USD',
    providers: [providerName],
    providerData: {},
    getDuration: () => 270,
    isSameFlight: () => true,
  } as Flight;
};

class MockProvider implements FlightProvider {
  name: string;
  flightsToReturn: Flight[];
  shouldFail: boolean;

  constructor(name: string, flightsToReturn: Flight[], shouldFail = false) {
    this.name = name;
    this.flightsToReturn = flightsToReturn;
    this.shouldFail = shouldFail;
  }

  async searchFlights(): Promise<Flight[]> {
    if (this.shouldFail) {
      throw new Error(`${this.name} failed`);
    }
    return this.flightsToReturn;
  }
}

describe('FlightSearchService', () => {
  let service: FlightSearchService;
  let deduplicator: FlightDeduplicatorService;
  let sorter: FlightSorterService;
  let filter: FlightFilterService;

  beforeEach(async () => {
    const mockProvider1 = new MockProvider('Provider A', [
      createMockFlight('id1', 300, 'Provider A'),
    ]);
    const mockProvider2 = new MockProvider('Provider B', [
      createMockFlight('id1', 250, 'Provider B'),
    ]);

    const module = await Test.createTestingModule({
      providers: [
        FlightSearchService,
        FlightDeduplicatorService,
        FlightSorterService,
        FlightFilterService,
        {
          provide: 'FLIGHT_PROVIDERS',
          useValue: [mockProvider1, mockProvider2],
        },
      ],
    }).compile();

    service = module.get<FlightSearchService>(FlightSearchService);
    deduplicator = module.get<FlightDeduplicatorService>(
      FlightDeduplicatorService,
    );
    sorter = module.get<FlightSorterService>(FlightSorterService);
    filter = module.get<FlightFilterService>(FlightFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call providers, deduplicate, sort, and return results', async () => {
    const result = await service.searchFlights({
      from: 'DAC',
      to: 'DXB',
      date: '2026-07-01',
      passengers: 1,
    });

    expect(result.flights.length).toBe(1);
    expect(result.flights[0].price).toBe(250);
    expect(result.flights[0].providers).toContain('Provider A');
    expect(result.flights[0].providers).toContain('Provider B');
    expect(result.meta.completeness).toBe('complete');
  });

  it('should handle failed providers with fail-open strategy', async () => {
    const failingProvider = new MockProvider('Provider C', [], true);
    const workingProvider = new MockProvider('Provider A', [
      createMockFlight('id1', 300, 'Provider A'),
    ]);

    const module = await Test.createTestingModule({
      providers: [
        FlightSearchService,
        FlightDeduplicatorService,
        FlightSorterService,
        FlightFilterService,
        {
          provide: 'FLIGHT_PROVIDERS',
          useValue: [failingProvider, workingProvider],
        },
      ],
    }).compile();

    const testService = module.get<FlightSearchService>(FlightSearchService);
    const result = await testService.searchFlights({
      from: 'DAC',
      to: 'DXB',
      date: '2026-07-01',
      passengers: 1,
    });

    expect(result.flights.length).toBe(1);
    expect(result.meta.providers.success).toContain('Provider A');
    expect(result.meta.providers.failed).toContain('Provider C');
    expect(result.meta.completeness).toBe('partial');
  });
});
