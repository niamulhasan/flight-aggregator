# Phase 4: Search Use Case & API Plan

## Description
This phase implements the flight search use case, including parallel provider calls, failure handling, sorting, filtering, and the API endpoint.

## Clean Architecture Context
The search service belongs to the **Use Cases** layer, and the controller belongs to the **Interface Adapters** layer.
* Reference: [Clean Architecture Constitution](constitutions/clean_architecture.md)

## Prerequisites
- [ ] Phase 1 completed: Project setup with NestJS and Swagger
- [ ] Phase 2 completed: Flight entity, DTOs, and deduplication service
- [ ] Phase 3 completed: Mock providers and adapters

## Task Order
Execute tasks in this exact order:
1. Task 4.1: Implement FlightSorterService
2. Task 4.2: Implement FlightFilterService
3. Task 4.3: Implement FlightSearchService
4. Task 4.4: Create SearchController
5. Task 4.5: Create SearchModule

---

## Task 4.1: Implement FlightSorterService

### File Path
`flight-search/src/application/services/flight-sorter.service.ts`

### Implementation Steps
1. [ ] Create the service:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { Flight } from '../../domain/entities/flight';
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
   ```

### Validation
- [ ] Supports sorting by price, duration, and departure time
- [ ] Supports both ascending and descending order
- [ ] Returns new array (doesn't mutate input)

---

## Task 4.2: Implement FlightFilterService

### File Path
`flight-search/src/application/services/flight-filter.service.ts`

### Implementation Steps
1. [ ] Create the service:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { Flight } from '../../domain/entities/flight';
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
   ```

### Validation
- [ ] Supports filtering by max stops
- [ ] Supports filtering by carrier codes
- [ ] Supports filtering by price range

---

## Task 4.3: Implement FlightSearchService

### File Path
`flight-search/src/application/use-cases/flight-search.service.ts`

### Implementation Steps
1. [ ] Create the service:
   ```typescript
   import { Injectable, Logger } from '@nestjs/common';
   import { Flight } from '../../domain/entities/flight';
   import { FlightProvider } from '../../infrastructure/providers/flight-provider.interface';
   import { FlightDeduplicatorService } from '../../domain/services/flight-deduplicator.service';
   import { FlightSorterService } from '../services/flight-sorter.service';
   import { FlightFilterService } from '../services/flight-filter.service';
   import { SearchFlightsDto, SearchResponseDto, FlightResponseDto } from '../../interface/dtos/search-flights.dto';

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
           this.logger.error(`Provider ${provider.name} failed: ${error.message}`);
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
   ```

### Validation
- [ ] Calls all providers in parallel
- [ ] Implements fail-open strategy for failed providers
- [ ] Deduplicates, filters, and sorts flights
- [ ] Returns completeness information in metadata

---

## Task 4.4: Create SearchController

### File Path
`flight-search/src/interface/controllers/search.controller.ts`

### Implementation Steps
1. [ ] Create the controller:
   ```typescript
   import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
   import { ApiTags, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
   import { FlightSearchService } from '../../application/use-cases/flight-search.service';
   import { SearchFlightsDto, SearchResponseDto } from '../dtos/search-flights.dto';

   @ApiTags('flights')
   @Controller('api/flights')
   export class SearchController {
     constructor(private readonly searchService: FlightSearchService) {}

     @Get('search')
     @ApiOperation({ summary: 'Search flights across multiple providers' })
     @ApiQuery({ name: 'from', description: 'Origin IATA code', example: 'DAC' })
     @ApiQuery({ name: 'to', description: 'Destination IATA code', example: 'DXB' })
     @ApiQuery({ name: 'date', description: 'Travel date (YYYY-MM-DD)', example: '2026-07-01' })
     @ApiQuery({ name: 'passengers', description: 'Number of passengers', example: 2, required: true })
     @ApiOkResponse({ description: 'Search results with completeness information', type: SearchResponseDto })
     async search(
       @Query(ValidationPipe) params: SearchFlightsDto,
     ): Promise<SearchResponseDto> {
       return this.searchService.searchFlights(params);
     }
   }
   ```

### Validation
- [ ] Implements `GET /api/flights/search` endpoint
- [ ] Uses validation pipe for DTO
- [ ] Complete Swagger documentation

---

## Task 4.5: Create SearchModule

### File Path
`flight-search/src/application/search.module.ts`

### Implementation Steps
1. [ ] Create the module:
   ```typescript
   import { Module } from '@nestjs/common';
   import { ProvidersModule } from '../infrastructure/providers/providers.module';
   import { FlightSearchService } from './use-cases/flight-search.service';
   import { FlightSorterService } from './services/flight-sorter.service';
   import { FlightFilterService } from './services/flight-filter.service';
   import { FlightDeduplicatorService } from '../domain/services/flight-deduplicator.service';
   import { SearchController } from '../interface/controllers/search.controller';

   @Module({
     imports: [ProvidersModule],
     providers: [
       FlightSearchService,
       FlightSorterService,
       FlightFilterService,
       FlightDeduplicatorService,
     ],
     controllers: [SearchController],
     exports: [FlightSearchService],
   })
   export class SearchModule {}
   ```

2. [ ] Update `app.module.ts` to import `SearchModule`:
   ```typescript
   @Module({
     imports: [
       ConfigModule.forRoot(...),
       TypeOrmModule.forRootAsync(...),
       SearchModule, // <-- Add this
     ],
   })
   export class AppModule {}
   ```

### Validation
- [ ] Imports `ProvidersModule`
- [ ] Registers all services and controller
- [ ] Added to `AppModule`

---

## Success Criteria
- [ ] All providers called in parallel
- [ ] Failures handled gracefully (fail-open)
- [ ] Sorting works correctly for all supported fields
- [ ] Filtering works correctly for all supported filters
- [ ] Search endpoint documented with Swagger
- [ ] Response includes completeness information