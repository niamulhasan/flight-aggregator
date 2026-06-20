import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Flight } from '../../domain/entities/flight.entity';
import { FlightIdGeneratorService } from '../../domain/services/flight-id-generator.service';
import { FlightProvider } from './flight-provider.interface';

interface ProviderAFlight {
  carrier: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  stops: number;
  fare_usd: number;
  flight_no: string;
}

interface ProviderAResponse {
  flights: ProviderAFlight[];
}

@Injectable()
export class ProviderAAdapter implements FlightProvider {
  readonly name = 'Provider A';
  private readonly logger = new Logger(ProviderAAdapter.name);

  constructor(
    private configService: ConfigService,
    private flightIdGenerator: FlightIdGeneratorService,
  ) {}

  async searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
    try {
      const url = this.configService.get<string>('PROVIDER_A_URL', 'http://provider-a:3001');
      const response = await axios.get<ProviderAResponse>(`${url}/api/flights`, {
        params: { from, to, date, passengers: 1 },
        timeout: 5000,
      });

      return response.data.flights.map(raw => {
        const flight = new Flight();
        flight.id = this.flightIdGenerator.generateFlightId({
          carrier: raw.carrier,
          flightNo: raw.flight_no,
          depart: raw.depart,
        });
        flight.carrier = raw.carrier;
        flight.flightNo = raw.flight_no;
        flight.from = raw.from;
        flight.to = raw.to;
        flight.depart = new Date(raw.depart);
        flight.arrive = new Date(raw.arrive);
        flight.stops = raw.stops;
        flight.price = raw.fare_usd;
        flight.currency = 'USD';
        flight.providers = [this.name];
        flight.providerData = { [this.name]: raw };
        return flight;
      });
    } catch (error) {
      this.logger.error(`Failed to fetch from ${this.name}: ${(error as Error).message}`);
      return [];
    }
  }
}
