import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../domain/entities/booking.entity';
import { IBookingRepository } from '../../domain/repositories/booking.repository.interface';

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  async save(booking: Booking): Promise<Booking> {
    return this.repository.save(booking);
  }

  async findByReference(reference: string): Promise<Booking | null> {
    return this.repository.findOneBy({ reference });
  }
}
