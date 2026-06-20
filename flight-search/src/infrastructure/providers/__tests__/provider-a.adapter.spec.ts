import { Test } from '@nestjs/testing';
import { ProviderAAdapter } from '../provider-a.adapter';
import { FlightIdGeneratorService } from '../../../domain/services/flight-id-generator.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');

describe('ProviderAAdapter', () => {
  let adapter: ProviderAAdapter;
  let flightIdGenerator: FlightIdGeneratorService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProviderAAdapter,
        FlightIdGeneratorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3001'),
          },
        },
      ],
    }).compile();

    adapter = module.get<ProviderAAdapter>(ProviderAAdapter);
    flightIdGenerator = module.get<FlightIdGeneratorService>(FlightIdGeneratorService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call axios and map response to Flight objects', async () => {
    const mockFlightData = {
      carrier: 'AA',
      flight_no: 'AA101',
      from: 'DAC',
      to: 'DXB',
      depart: '2026-07-01T08:00:00',
      arrive: '2026-07-01T12:30:00',
      stops: 0,
      fare_usd: 300,
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { flights: [mockFlightData] },
    });

    const flights = await adapter.searchFlights('DAC', 'DXB', '2026-07-01');

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/flights', {
      params: { from: 'DAC', to: 'DXB', date: '2026-07-01', passengers: 1 },
      timeout: 5000,
    });

    expect(flights.length).toBe(1);
    expect(flights[0].carrier).toBe('AA');
    expect(flights[0].flightNo).toBe('AA101');
  });

  it('should return empty array and log error on axios failure', async () => {
    const loggerSpy = jest.spyOn(adapter['logger'], 'error');
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    const flights = await adapter.searchFlights('DAC', 'DXB', '2026-07-01');

    expect(flights).toEqual([]);
    expect(loggerSpy).toHaveBeenCalled();
  });
});
