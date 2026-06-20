import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Flight } from '../../domain/entities/flight.entity';
import { FlightIdGeneratorService } from '../../domain/services/flight-id-generator.service';
import { FlightProvider, SearchParams } from './flight-provider.interface';

interface ProviderCFlight {
  iata: string;
  route: { src: string; dst: string };
  times: { dep: number; arr: number };
  layovers: number;
  total_price: number;
  currency: string;
  code: string;
}

interface ProviderCResponse {
  results: ProviderCFlight[];
}

@Injectable()
export class ProviderCAdapter implements FlightProvider {
  private readonly logger = new Logger(ProviderCAdapter.name);
  readonly name = 'Provider C';

  constructor(
    private configService: ConfigService,
    private flightIdGenerator: FlightIdGeneratorService,
  ) {}

  async searchFlights(params: SearchParams): Promise<Flight[]> {
    try {
      const url = this.configService.get<string>('PROVIDER_C_URL', 'http://provider-c:3003');
      const response = await axios.get<ProviderCResponse>(`${url}/api/flights`, {
        params,
        timeout: 5000,
      });

      return response.data.results.map(raw => {
        const flight = new Flight();
        const departDate = new Date(raw.times.dep * 1000);
        const arriveDate = new Date(raw.times.arr * 1000);

        flight.id = this.flightIdGenerator.generateFlightId({
          carrier: raw.iata,
          flightNo: raw.code,
          depart: departDate,
        });
        flight.carrier = raw.iata;
        flight.flightNo = raw.code;
        flight.from = raw.route.src;
        flight.to = raw.route.dst;
        flight.depart = departDate;
        flight.arrive = arriveDate;
        flight.stops = raw.layovers;
        flight.price = raw.total_price;
        flight.currency = raw.currency;
        flight.providers = [this.name];
        flight.providerData = { providerC: raw };
        return flight;
      });
    } catch (error) {
      this.logger.error(`Failed to fetch from ${this.name}: ${(error as Error).message}`);
      return [];
    }
  }
}
