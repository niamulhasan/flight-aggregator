import { Module } from '@nestjs/common';
import { ProviderAAdapter } from './provider-a.adapter';
import { ProviderBAdapter } from './provider-b.adapter';
import { ProviderCAdapter } from './provider-c.adapter';
import { FlightProvider } from './flight-provider.interface';
import { FlightIdGeneratorService } from '../../domain/services/flight-id-generator.service';

const flightProviders = [ProviderAAdapter, ProviderBAdapter, ProviderCAdapter];

@Module({
  providers: [
    FlightIdGeneratorService,
    ...flightProviders,
    {
      provide: 'FLIGHT_PROVIDERS',
      useFactory: (...providers: FlightProvider[]) => providers,
      inject: flightProviders,
    },
  ],
  exports: ['FLIGHT_PROVIDERS', ...flightProviders],
})
export class ProvidersModule {}
