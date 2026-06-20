import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Flight } from '../../domain/entities/flight.entity';
import { FlightIdGeneratorService } from '../../domain/services/flight-id-generator.service';
import { FlightProvider } from './flight-provider.interface';

interface ProviderBFlight {
  airline_code: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  segments: number;
  price: { amount: number; currency: string };
  number: string;
}

interface ProviderBResponse {
  data: ProviderBFlight[];
}

@Injectable()
export class ProviderBAdapter implements FlightProvider {
  private readonly logger = new Logger(ProviderBAdapter.name);
  readonly name = 'Provider B';

  constructor(
    private configService: ConfigService,
    private flightIdGenerator: FlightIdGeneratorService,
  ) {}

  async searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
    try {
      const url = this.configService.get<string>('PROVIDER_B_URL', 'http://provider-b:3002');
      const response = await axios.get<ProviderBResponse>(`${url}/api/flights`, {
        params: { from, to, date, passengers: 1 },
        timeout: 5000,
      });

      return response.data.data.map(raw => {
        const flight = new Flight();
        const departStr = raw.departure_time.replace(' ', 'T');
        const arriveStr = raw.arrival_time.replace(' ', 'T');

        flight.id = this.flightIdGenerator.generateFlightId({
          carrier: raw.airline_code,
          flightNo: raw.number,
          depart: departStr,
        });
        flight.carrier = raw.airline_code;
        flight.flightNo = raw.number;
        flight.from = raw.origin;
        flight.to = raw.destination;
        flight.depart = new Date(departStr);
        flight.arrive = new Date(arriveStr);
        flight.stops = raw.segments;
        flight.price = raw.price.amount;
        flight.currency = raw.price.currency;
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
