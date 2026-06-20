import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../domain/entities/booking.entity';
import { BookingService } from './use-cases/booking.service';
import { BookingController } from '../interface/controllers/booking.controller';
import { BookingReferenceGeneratorService } from '../domain/services/booking-reference-generator.service';
import { BookingRepository } from '../infrastructure/repositories/booking.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  providers: [
    BookingService,
    BookingReferenceGeneratorService,
    {
      provide: 'BOOKING_REPOSITORY',
      useClass: BookingRepository,
    },
  ],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
