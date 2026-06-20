import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';
import { Flight } from './domain/entities/flight.entity';
import { Booking } from './domain/entities/booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),
    TypeOrmModule.forFeature([Flight, Booking]),
  ],
})
export class AppModule {}
