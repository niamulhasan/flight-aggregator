import { Test } from '@nestjs/testing';
import { ProviderBAdapter } from '../provider-b.adapter';
import { FlightIdGeneratorService } from '../../../domain/services/flight-id-generator.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');

describe('ProviderBAdapter', () => {
  let adapter: ProviderBAdapter;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProviderBAdapter,
        FlightIdGeneratorService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3002'),
          },
        },
      ],
    }).compile();

    adapter = module.get<ProviderBAdapter>(ProviderBAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call axios and map response to Flight objects', async () => {
    const mockFlightData = {
      airline_code: 'BS',
      number: 'BS118',
      origin: 'DAC',
      destination: 'DXB',
      departure_time: '2026-07-01 14:30',
      arrival_time: '2026-07-01 19:20',
      segments: 1,
      price: { amount: 265, currency: 'USD' },
    };

    (axios.get as jest.Mock).mockResolvedValue({
      data: { data: [mockFlightData] },
    });

    const flights = await adapter.searchFlights('DAC', 'DXB', '2026-07-01');

    expect(axios.get).toHaveBeenCalledWith('http://localhost:3002/api/flights', {
      params: { from: 'DAC', to: 'DXB', date: '2026-07-01', passengers: 1 },
      timeout: 5000,
    });

    expect(flights.length).toBe(1);
    expect(flights[0].carrier).toBe('BS');
    expect(flights[0].flightNo).toBe('BS118');
  });

  it('should throw error on axios failure', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(adapter.searchFlights('DAC', 'DXB', '2026-07-01')).rejects.toThrow('Network error');
  });
});
