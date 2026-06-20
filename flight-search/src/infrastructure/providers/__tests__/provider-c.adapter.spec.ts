import { Test } from '@nestjs/testing';
import { ProviderCAdapter } from '../provider-c.adapter';
import { FlightIdGeneratorService } from '../../../domain/services/flight-id-generator.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');

describe('ProviderCAdapter', () => {
  let adapter: ProviderCAdapter;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProviderCAdapter,
        FlightIdGeneratorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3003'),
          },
        },
      ],
    }).compile();

    adapter = module.get<ProviderCAdapter>(ProviderCAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call axios and map response to Flight objects', async () => {
    const mockFlightData = {
      iata: 'AA',
      code: 'AA101',
      route: { src: 'DAC', dst: 'DXB' },
      times: { dep: 1782892800, arr: 1782909000 },
      layovers: 0,
      total_price: 300,
      currency: 'USD',
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { results: [mockFlightData] },
    });

    const flights = await adapter.searchFlights('DAC', 'DXB', '2026-07-01');

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3003/api/flights', {
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
