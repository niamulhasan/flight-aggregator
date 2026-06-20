import { Flight } from '../../domain/entities/flight.entity';

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

export interface FlightProvider {
  readonly name: string;
  searchFlights(params: SearchParams): Promise<Flight[]>;
}
