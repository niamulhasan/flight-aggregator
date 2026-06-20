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
