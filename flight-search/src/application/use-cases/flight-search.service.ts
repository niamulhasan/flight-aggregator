import { Injectable, Logger, Inject } from '@nestjs/common';
import { Flight } from '../../domain/entities/flight.entity';
import { FlightProvider } from '../../infrastructure/providers/flight-provider.interface';
import { FlightDeduplicatorService } from '../../domain/services/flight-deduplicator.service';
import { FlightSorterService } from '../services/flight-sorter.service';
import { FlightFilterService } from '../services/flight-filter.service';
import { SearchFlightsDto } from '../../interface/dtos/search-flights.dto';
import { SearchResponseDto } from '../../interface/dtos/search-response.dto';
import { FlightResponseDto } from '../../interface/dtos/flight-response.dto';

@Injectable()
export class FlightSearchService {
  private readonly logger = new Logger(FlightSearchService.name);

  constructor(
    @Inject('FLIGHT_PROVIDERS')
    private readonly providers: FlightProvider[],
    private readonly deduplicator: FlightDeduplicatorService,
    private readonly sorter: FlightSorterService,
    private readonly filter: FlightFilterService,
  ) {}

  async searchFlights(params: SearchFlightsDto): Promise<SearchResponseDto> {
    const { from, to, date } = params;
    const successProviders: string[] = [];
    const failedProviders: string[] = [];
    let allFlights: Flight[] = [];

    const providerPromises = this.providers.map(async (provider) => {
      try {
        this.logger.log(`Calling provider: ${provider.name}`);
        const flights = await provider.searchFlights(from, to, date);
        successProviders.push(provider.name);
        return flights;
      } catch (error) {
        this.logger.error(`Provider ${provider.name} failed: ${(error as Error).message}`);
        failedProviders.push(provider.name);
        return [];
      }
    });

    const results = await Promise.allSettled(providerPromises);

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allFlights = [...allFlights, ...result.value];
      }
    });

    let processedFlights = this.deduplicator.deduplicate(allFlights);
    processedFlights = this.filter.filter(processedFlights, params);
    processedFlights = this.sorter.sort(
      processedFlights,
      params.sortBy,
      params.sortOrder,
    );

    const flightDtos = processedFlights.map(this.toFlightResponseDto);
    const completeness =
      failedProviders.length === 0 ? 'complete' : 'partial';

    return {
      flights: flightDtos,
      meta: {
        total: flightDtos.length,
        providers: {
          available: this.providers.map((p) => p.name),
          success: successProviders,
          failed: failedProviders,
        },
        completeness,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private toFlightResponseDto(flight: Flight): FlightResponseDto {
    return {
      id: flight.id,
      carrier: flight.carrier,
      flightNo: flight.flightNo,
      from: flight.from,
      to: flight.to,
      depart: flight.depart.toISOString(),
      arrive: flight.arrive.toISOString(),
      stops: flight.stops,
      price: flight.price,
      currency: flight.currency,
      providers: flight.providers,
    };
  }
}
