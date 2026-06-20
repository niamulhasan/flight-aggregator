import { Flight } from '../../domain/entities/flight.entity';

export interface FlightProvider {
  readonly name: string;
  searchFlights(from: string, to: string, date: string): Promise<Flight[]>;
}
