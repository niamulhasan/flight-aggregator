# Phase 3: Mock Providers Implementation Plan

## Description
This phase creates 3 mock provider services (each in their own Docker container) and their corresponding adapters in the main app.

## Clean Architecture Context
The provider adapters belong to the **Interface Adapters** layer - they convert different provider response formats into our unified Flight entity.
* Reference: [Clean Architecture Constitution](constitutions/clean_architecture.md)

## Prerequisites
- [ ] Phase 1 completed: Project structure and Docker infrastructure set up
- [ ] Phase 2 completed: Flight entity defined

## Task Order
Execute tasks in this exact order:
1. Task 3.1: Create Provider A Mock Service
2. Task 3.2: Create Provider B Mock Service
3. Task 3.3: Create Provider C Mock Service
4. Task 3.4: Define Common FlightProvider Interface
5. Task 3.5: Implement Provider A Adapter
6. Task 3.6: Implement Provider B Adapter
7. Task 3.7: Implement Provider C Adapter
8. Task 3.8: Create Provider Module

---

## Task 3.1: Create Provider A Mock Service

### File Paths
- Main File: `provider-a/src/index.js`
- Package: `provider-a/package.json`

### Implementation Steps
1. [ ] Initialize simple Express project in `provider-a/`:
   ```bash
   cd provider-a
   npm init -y
   npm install express cors @nestjs/swagger swagger-ui-express
   ```

2. [ ] Create `provider-a/package.json`:
   ```json
   {
     "name": "provider-a",
     "version": "1.0.0",
     "description": "Mock Flight Provider A",
     "main": "src/index.js",
     "scripts": {
       "start": "node src/index.js"
     },
     "dependencies": {
       "cors": "^2.8.5",
       "express": "^4.18.2",
       "@nestjs/swagger": "^7.1.17",
       "swagger-ui-express": "^5.0.0"
     }
   }
   ```

3. [ ] Create `provider-a/src/index.js`:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const swaggerUi = require('swagger-ui-express');
   const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');

   const app = express();
   const PORT = parseInt(process.env.PORT, 10) || 3001;

   app.use(cors());
   app.use(express.json());

   // Mock flight data for Provider A
   const mockFlights = {
     "flights": [
       { "carrier": "AA", "from": "DAC", "to": "DXB", "depart": "2026-07-01T08:00:00", "arrive": "2026-07-01T12:30:00", "stops": 0, "fare_usd": 320.00, "flight_no": "AA101" },
       { "carrier": "AA", "from": "DAC", "to": "DXB", "depart": "2026-07-01T22:10:00", "arrive": "2026-07-02T02:40:00", "stops": 0, "fare_usd": 280.00, "flight_no": "AA205" },
       { "carrier": "BS", "from": "DAC", "to": "DXB", "depart": "2026-07-01T09:15:00", "arrive": "2026-07-01T15:00:00", "stops": 1, "fare_usd": 310.00, "flight_no": "BS220" },
       { "carrier": "EK", "from": "DAC", "to": "DXB", "depart": "2026-07-01T03:45:00", "arrive": "2026-07-01T06:50:00", "stops": 0, "fare_usd": 410.00, "flight_no": "EK585" }
     ]
   };

   // Search endpoint
   app.get('/search', (req, res) => {
     const { from, to, date } = req.query;
     console.log(`Provider A search: ${from} -> ${to} on ${date}`);
     res.json(mockFlights);
   });

   // Set up Swagger (simplified for Express)
   const swaggerDocument = {
     openapi: '3.0.0',
     info: {
       title: 'Provider A API',
       version: '1.0.0',
       description: 'Mock flight provider API'
     },
     paths: {
       '/search': {
         get: {
           summary: 'Search flights',
           parameters: [
             { in: 'query', name: 'from', schema: { type: 'string' }, required: true },
             { in: 'query', name: 'to', schema: { type: 'string' }, required: true },
             { in: 'query', name: 'date', schema: { type: 'string' }, required: true }
           ],
           responses: { '200': { description: 'Successful response' } }
         }
       }
     }
   };
   app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

   app.listen(PORT, () => {
     console.log(`Provider A running on http://localhost:${PORT}`);
     console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
   });
   ```

### Validation
- [ ] Express project initialized in `provider-a/`
- [ ] `/search` endpoint returns correct mock data
- [ ] Swagger documentation accessible at `/api/docs`
- [ ] Port 3001 configured

---

## Task 3.2: Create Provider B Mock Service

### File Paths
- Main File: `provider-b/src/index.js`
- Package: `provider-b/package.json`

### Implementation Steps
1. [ ] Initialize simple Express project in `provider-b/` (same as Provider A)

2. [ ] Create `provider-b/src/index.js`:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const swaggerUi = require('swagger-ui-express');

   const app = express();
   const PORT = parseInt(process.env.PORT, 10) || 3002;

   app.use(cors());
   app.use(express.json());

   // Mock flight data for Provider B
   const mockFlights = {
     "data": [
       { "airline_code": "BS", "origin": "DAC", "destination": "DXB", "departure_time": "2026-07-01 09:15", "arrival_time": "2026-07-01 15:00", "segments": 1, "price": { "amount": 295, "currency": "USD" }, "number": "BS220" },
       { "airline_code": "BS", "origin": "DAC", "destination": "DXB", "departure_time": "2026-07-01 14:30", "arrival_time": "2026-07-01 19:20", "segments": 1, "price": { "amount": 265, "currency": "USD" }, "number": "BS118" },
       { "airline_code": "EK", "origin": "DAC", "destination": "DXB", "departure_time": "2026-07-01 03:45", "arrival_time": "2026-07-01 06:50", "segments": 0, "price": { "amount": 399, "currency": "USD" }, "number": "EK585" }
     ]
   };

   app.get('/search', (req, res) => {
     const { from, to, date } = req.query;
     console.log(`Provider B search: ${from} -> ${to} on ${date}`);
     res.json(mockFlights);
   });

   const swaggerDocument = {
     openapi: '3.0.0',
     info: { title: 'Provider B API', version: '1.0.0' },
     paths: {
       '/search': {
         get: {
           summary: 'Search flights',
           parameters: [
             { in: 'query', name: 'from', schema: { type: 'string' }, required: true },
             { in: 'query', name: 'to', schema: { type: 'string' }, required: true },
             { in: 'query', name: 'date', schema: { type: 'string' }, required: true }
           ],
           responses: { '200': { description: 'Successful response' } }
         }
       }
     }
   };
   app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

   app.listen(PORT, () => {
     console.log(`Provider B running on http://localhost:${PORT}`);
     console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
   });
   ```

### Validation
- [ ] Express project initialized in `provider-b/`
- [ ] `/search` endpoint returns correct mock data
- [ ] Swagger documentation accessible at `/api/docs`
- [ ] Port 3002 configured

---

## Task 3.3: Create Provider C Mock Service

### File Paths
- Main File: `provider-c/src/index.js`
- Package: `provider-c/package.json`

### Implementation Steps
1. [ ] Initialize simple Express project in `provider-c/` (same as Provider A)

2. [ ] Create `provider-c/src/index.js`:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const swaggerUi = require('swagger-ui-express');

   const app = express();
   const PORT = parseInt(process.env.PORT, 10) || 3003;

   app.use(cors());
   app.use(express.json());

   // Mock flight data for Provider C (Unix timestamps)
   const mockFlights = {
     "results": [
       { "iata": "AA", "route": { "src": "DAC", "dst": "DXB" }, "times": { "dep": 1782892800, "arr": 1782909000 }, "layovers": 0, "total_price": 335, "currency": "USD", "code": "AA101" },
       { "iata": "CJ", "route": { "src": "DAC", "dst": "DXB" }, "times": { "dep": 1782885600, "arr": 1782903600 }, "layovers": 2, "total_price": 270, "currency": "USD", "code": "CJ300" },
       { "iata": "EK", "route": { "src": "DAC", "dst": "DXB" }, "times": { "dep": 1782877500, "arr": 1782888600 }, "layovers": 0, "total_price": 405, "currency": "USD", "code": "EK585" }
     ]
   };

   app.get('/search', (req, res) => {
     const { from, to, date } = req.query;
     console.log(`Provider C search: ${from} -> ${to} on ${date}`);
     res.json(mockFlights);
   });

   const swaggerDocument = {
     openapi: '3.0.0',
     info: { title: 'Provider C API', version: '1.0.0' },
     paths: {
       '/search': {
         get: {
           summary: 'Search flights',
           parameters: [
             { in: 'query', name: 'from', schema: { type: 'string' }, required: true },
             { in: 'query', name: 'to', schema: { type: 'string' }, required: true },
             { in: 'query', name: 'date', schema: { type: 'string' }, required: true }
           ],
           responses: { '200': { description: 'Successful response' } }
         }
       }
     }
   };
   app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

   app.listen(PORT, () => {
     console.log(`Provider C running on http://localhost:${PORT}`);
     console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
   });
   ```

### Validation
- [ ] Express project initialized in `provider-c/`
- [ ] `/search` endpoint returns correct mock data (Unix timestamps)
- [ ] Swagger documentation accessible at `/api/docs`
- [ ] Port 3003 configured

---

## Task 3.4: Define Common FlightProvider Interface

### File Path
`flight-search/src/infrastructure/providers/flight-provider.interface.ts`

### Implementation Steps
1. [ ] Create the interface file:
   ```typescript
   import { Flight } from '../../domain/entities/flight';

   export interface FlightProvider {
     readonly name: string;
     searchFlights(from: string, to: string, date: string): Promise<Flight[]>;
   }
   ```

### Validation
- [ ] Interface defines `name` and `searchFlights` method
- [ ] Returns Promise of Flight array
- [ ] Located in correct Infrastructure layer directory

---

## Task 3.5: Implement Provider A Adapter

### File Path
`flight-search/src/infrastructure/providers/provider-a.adapter.ts`

### Implementation Steps
1. [ ] Create the adapter:
   ```typescript
   import { Injectable, Logger } from '@nestjs/common';
   import { HttpService } from '@nestjs/axios';
   import { firstValueFrom } from 'rxjs';
   import { Flight } from '../../domain/entities/flight';
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
     readonly name = 'ProviderA';
     private readonly logger = new Logger(ProviderAAdapter.name);

     constructor(
       private readonly httpService: HttpService,
       private readonly flightIdGenerator: FlightIdGeneratorService,
     ) {}

     async searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
       const url = `${process.env.PROVIDER_A_URL}/search`;
       this.logger.log(`Searching ${this.name}: ${from} -> ${to} on ${date}`);

       try {
         const response = await firstValueFrom(
           this.httpService.get<ProviderAResponse>(url, {
             params: { from, to, date },
             timeout: 5000,
           }),
         );

         return response.data.flights.map((rawFlight) =>
           this.mapToFlight(rawFlight),
         );
       } catch (error) {
         this.logger.error(`Error searching ${this.name}: ${error.message}`);
         throw error;
       }
     }

     private mapToFlight(raw: ProviderAFlight): Flight {
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
     }
   }
   ```

### Validation
- [ ] Implements `FlightProvider` interface
- [ ] Uses `HttpService` to call Provider A
- [ ] Correctly maps Provider A schema to Flight entity
- [ ] Handles date parsing (ISO format)
- [ ] Generates stable flight ID

---

## Task 3.6: Implement Provider B Adapter

### File Path
`flight-search/src/infrastructure/providers/provider-b.adapter.ts`

### Implementation Steps
1. [ ] Create the adapter:
   ```typescript
   import { Injectable, Logger } from '@nestjs/common';
   import { HttpService } from '@nestjs/axios';
   import { firstValueFrom } from 'rxjs';
   import { Flight } from '../../domain/entities/flight';
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
     readonly name = 'ProviderB';
     private readonly logger = new Logger(ProviderBAdapter.name);

     constructor(
       private readonly httpService: HttpService,
       private readonly flightIdGenerator: FlightIdGeneratorService,
     ) {}

     async searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
       const url = `${process.env.PROVIDER_B_URL}/search`;
       this.logger.log(`Searching ${this.name}: ${from} -> ${to} on ${date}`);

       try {
         const response = await firstValueFrom(
           this.httpService.get<ProviderBResponse>(url, {
             params: { from, to, date },
             timeout: 5000,
           }),
         );

         return response.data.data.map((rawFlight) =>
           this.mapToFlight(rawFlight),
         );
       } catch (error) {
         this.logger.error(`Error searching ${this.name}: ${error.message}`);
         throw error;
       }
     }

     private mapToFlight(raw: ProviderBFlight): Flight {
       const flight = new Flight();
       flight.id = this.flightIdGenerator.generateFlightId({
         carrier: raw.airline_code,
         flightNo: raw.number,
         depart: raw.departure_time,
       });
       flight.carrier = raw.airline_code;
       flight.flightNo = raw.number;
       flight.from = raw.origin;
       flight.to = raw.destination;
       flight.depart = new Date(raw.departure_time.replace(' ', 'T'));
       flight.arrive = new Date(raw.arrival_time.replace(' ', 'T'));
       flight.stops = raw.segments;
       flight.price = raw.price.amount;
       flight.currency = raw.price.currency;
       flight.providers = [this.name];
       flight.providerData = { [this.name]: raw };
       return flight;
     }
   }
   ```

### Validation
- [ ] Implements `FlightProvider` interface
- [ ] Correctly maps Provider B schema to Flight entity
- [ ] Handles date parsing (YYYY-MM-DD HH:mm format)
- [ ] Extracts price from nested object

---

## Task 3.7: Implement Provider C Adapter

### File Path
`flight-search/src/infrastructure/providers/provider-c.adapter.ts`

### Implementation Steps
1. [ ] Create the adapter:
   ```typescript
   import { Injectable, Logger } from '@nestjs/common';
   import { HttpService } from '@nestjs/axios';
   import { firstValueFrom } from 'rxjs';
   import { Flight } from '../../domain/entities/flight';
   import { FlightIdGeneratorService } from '../../domain/services/flight-id-generator.service';
   import { FlightProvider } from './flight-provider.interface';

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
     readonly name = 'ProviderC';
     private readonly logger = new Logger(ProviderCAdapter.name);

     constructor(
       private readonly httpService: HttpService,
       private readonly flightIdGenerator: FlightIdGeneratorService,
     ) {}

     async searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
       const url = `${process.env.PROVIDER_C_URL}/search`;
       this.logger.log(`Searching ${this.name}: ${from} -> ${to} on ${date}`);

       try {
         const response = await firstValueFrom(
           this.httpService.get<ProviderCResponse>(url, {
             params: { from, to, date },
             timeout: 5000,
           }),
         );

         return response.data.results.map((rawFlight) =>
           this.mapToFlight(rawFlight),
         );
       } catch (error) {
         this.logger.error(`Error searching ${this.name}: ${error.message}`);
         throw error;
       }
     }

     private mapToFlight(raw: ProviderCFlight): Flight {
       const flight = new Flight();
       flight.id = this.flightIdGenerator.generateFlightId({
         carrier: raw.iata,
         flightNo: raw.code,
         depart: new Date(raw.times.dep * 1000).toISOString(),
       });
       flight.carrier = raw.iata;
       flight.flightNo = raw.code;
       flight.from = raw.route.src;
       flight.to = raw.route.dst;
       flight.depart = new Date(raw.times.dep * 1000);
       flight.arrive = new Date(raw.times.arr * 1000);
       flight.stops = raw.layovers;
       flight.price = raw.total_price;
       flight.currency = raw.currency;
       flight.providers = [this.name];
       flight.providerData = { [this.name]: raw };
       return flight;
     }
   }
   ```

### Validation
- [ ] Implements `FlightProvider` interface
- [ ] Correctly maps Provider C schema to Flight entity
- [ ] Handles Unix timestamp conversion to Date objects
- [ ] Extracts nested route and times data

---

## Task 3.8: Create Provider Module

### File Path
`flight-search/src/infrastructure/providers/providers.module.ts`

### Implementation Steps
1. [ ] Create the module:
   ```typescript
   import { Module } from '@nestjs/common';
   import { HttpModule } from '@nestjs/axios';
   import { ProviderAAdapter } from './provider-a.adapter';
   import { ProviderBAdapter } from './provider-b.adapter';
   import { ProviderCAdapter } from './provider-c.adapter';
   import { FlightProvider } from './flight-provider.interface';
   import { FlightIdGeneratorService } from '../../domain/services/flight-id-generator.service';

   const flightProviders = [
     ProviderAAdapter,
     ProviderBAdapter,
     ProviderCAdapter,
   ];

   @Module({
     imports: [HttpModule],
     providers: [
       FlightIdGeneratorService,
       ...flightProviders,
       {
         provide: 'FLIGHT_PROVIDERS',
         useFactory: (...providers: FlightProvider[]) => providers,
         inject: flightProviders,
       },
     ],
     exports: ['FLIGHT_PROVIDERS', ...flightProviders],
   })
   export class ProvidersModule {}
   ```

### Validation
- [ ] Imports `HttpModule`
- [ ] Registers all 3 provider adapters
- [ ] Provides `FLIGHT_PROVIDERS` token with all adapters
- [ ] Exports all providers and token

---

## Success Criteria
- [ ] All 3 mock providers are Dockerized and runnable
- [ ] Each provider has its own Swagger documentation
- [ ] Provider adapters correctly map different schemas to unified Flight entity
- [ ] All adapters implement the common `FlightProvider` interface
- [ ] `ProvidersModule` created and exports all adapters