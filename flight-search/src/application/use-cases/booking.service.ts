import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Booking } from '../../domain/entities/booking.entity';
import { BookingReferenceGeneratorService } from '../../domain/services/booking-reference-generator.service';
import type { IBookingRepository } from '../../domain/repositories/booking.repository.interface';
import { CreateBookingDto } from '../../interface/dtos/create-booking.dto';
import { BookingResponseDto } from '../../interface/dtos/booking-response.dto';

@Injectable()
export class BookingService {
  constructor(
    @Inject('BOOKING_REPOSITORY')
    private readonly repository: IBookingRepository,
    private readonly referenceGenerator: BookingReferenceGeneratorService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<BookingResponseDto> {
    const booking = new Booking();
    booking.reference = this.referenceGenerator.generateReference();
    booking.flightId = dto.flightId;
    booking.passengers = dto.passengers.map((p) => ({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
    }));

    const savedBooking = await this.repository.save(booking);
    return this.toBookingResponseDto(savedBooking);
  }

  async getBookingByReference(reference: string): Promise<BookingResponseDto> {
    const booking = await this.repository.findByReference(reference);

    if (!booking) {
      throw new NotFoundException(
        `Booking with reference ${reference} not found`,
      );
    }

    return this.toBookingResponseDto(booking);
  }

  private toBookingResponseDto(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      reference: booking.reference,
      flightId: booking.flightId,
      passengers: booking.passengers,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}
