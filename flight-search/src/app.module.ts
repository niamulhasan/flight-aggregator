import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';
import { Flight } from './domain/entities/flight.entity';
import { Booking } from './domain/entities/booking.entity';
import { FlightIdGeneratorService } from './domain/services/flight-id-generator.service';
import { FlightDeduplicatorService } from './domain/services/flight-deduplicator.service';
import { ProviderAAdapter } from './infrastructure/providers/provider-a.adapter';
import { ProviderBAdapter } from './infrastructure/providers/provider-b.adapter';
import { ProviderCAdapter } from './infrastructure/providers/provider-c.adapter';

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
  providers: [
    FlightIdGeneratorService,
    FlightDeduplicatorService,
    ProviderAAdapter,
    ProviderBAdapter,
    ProviderCAdapter,
  ],
})
export class AppModule {}
