import { Test } from '@nestjs/testing';
import { BookingService } from '../booking.service';
import { BookingReferenceGeneratorService } from '../../../domain/services/booking-reference-generator.service';
import { NotFoundException } from '@nestjs/common';

interface MockBooking {
  id: string;
  reference: string;
  flightId: string;
  passengers: any[];
  createdAt: Date;
  updatedAt: Date;
}

const mockBookingRepository = {
  save: jest.fn(),
  findByReference: jest.fn(),
};

describe('BookingService', () => {
  let service: BookingService;
  let refGenerator: BookingReferenceGeneratorService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BookingService,
        BookingReferenceGeneratorService,
        {
          provide: 'BOOKING_REPOSITORY',
          useValue: mockBookingRepository,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    refGenerator = module.get<BookingReferenceGeneratorService>(BookingReferenceGeneratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a booking', async () => {
    const mockBooking: MockBooking = {
      id: '1',
      reference: 'FB-TEST123',
      flightId: 'flight123',
      passengers: [{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookingRepository.save.mockResolvedValue(mockBooking);

    const result = await service.createBooking({
      flightId: 'flight123',
      passengers: [{ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }],
    });

    expect(mockBookingRepository.save).toHaveBeenCalled();
    expect(result.reference).toBe('FB-TEST123');
    expect(result.flightId).toBe('flight123');
  });

  it('should get a booking by reference', async () => {
    const mockBooking: MockBooking = {
      id: '1',
      reference: 'FB-TEST123',
      flightId: 'flight123',
      passengers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBookingRepository.findByReference.mockResolvedValue(mockBooking);

    const result = await service.getBookingByReference('FB-TEST123');
    expect(result.reference).toBe('FB-TEST123');
  });

  it('should throw NotFoundException if booking not found', async () => {
    mockBookingRepository.findByReference.mockResolvedValue(null);

    await expect(service.getBookingByReference('invalid')).rejects.toThrow(NotFoundException);
  });
});
