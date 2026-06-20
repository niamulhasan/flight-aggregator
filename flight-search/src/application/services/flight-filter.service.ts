import { Injectable } from '@nestjs/common';
import { Flight } from '../../domain/entities/flight.entity';
import { SearchFlightsDto } from '../../interface/dtos/search-flights.dto';

@Injectable()
export class FlightFilterService {
  filter(flights: Flight[], filters: Partial<SearchFlightsDto>): Flight[] {
    return flights.filter((flight) => {
      if (filters.maxStops !== undefined && flight.stops > filters.maxStops) {
        return false;
      }

      if (filters.carriers && filters.carriers.length > 0) {
        if (!filters.carriers.includes(flight.carrier)) {
          return false;
        }
      }

      if (filters.minPrice !== undefined && flight.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== undefined && flight.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }
}
