import { Injectable } from '@nestjs/common';
import { Flight } from '../entities/flight.entity';

@Injectable()
export class FlightDeduplicatorService {
  deduplicate(flights: Flight[]): Flight[] {
    const flightMap = new Map<string, Flight[]>();

    // Group flights by ID
    for (const flight of flights) {
      if (!flightMap.has(flight.id)) {
        flightMap.set(flight.id, []);
      }
      flightMap.get(flight.id)!.push(flight);
    }

    // Process each group
    const result: Flight[] = [];
    for (const [, group] of flightMap) {
      // Find flight with lowest price
      const lowestPriceFlight = group.reduce((min, flight) =>
        flight.price < min.price ? flight : min,
      );

      // Create a new Flight instance
      const resultFlight = new Flight();
      Object.assign(resultFlight, lowestPriceFlight);

      // Merge providers from all flights in group
      const allProviders = [...new Set(group.flatMap((f) => f.providers))];
      resultFlight.providers = allProviders;

      // Merge providerData (combine all raw data)
      resultFlight.providerData = group.reduce(
        (acc, flight) => ({
          ...acc,
          ...flight.providerData,
        }),
        {},
      );

      result.push(resultFlight);
    }

    return result;
  }
}
