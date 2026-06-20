import { Injectable } from '@nestjs/common';
import { Flight } from '../../domain/entities/flight.entity';
import { SortBy, SortOrder } from '../../interface/dtos/search-flights.dto';

@Injectable()
export class FlightSorterService {
  sort(
    flights: Flight[],
    sortBy: SortBy = SortBy.PRICE,
    sortOrder: SortOrder = SortOrder.ASC,
  ): Flight[] {
    return [...flights].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortBy.PRICE:
          comparison = a.price - b.price;
          break;
        case SortBy.DURATION:
          const durationA = a.arrive.getTime() - a.depart.getTime();
          const durationB = b.arrive.getTime() - b.depart.getTime();
          comparison = durationA - durationB;
          break;
        case SortBy.DEPARTURE:
          comparison = a.depart.getTime() - b.depart.getTime();
          break;
      }

      return sortOrder === SortOrder.DESC ? -comparison : comparison;
    });
  }
}
