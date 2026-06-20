import { Booking } from '../entities/booking.entity';

export interface IBookingRepository {
  save(booking: Booking): Promise<Booking>;
  findByReference(reference: string): Promise<Booking | null>;
}
