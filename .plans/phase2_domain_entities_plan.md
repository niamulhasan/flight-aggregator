# Phase 2: Core Domain & Entities Plan

## Description

This phase defines the core domain models, value objects, DTOs, and business logic for flight deduplication.

## Clean Architecture Context

These entities belong to the **Entities** layer (innermost layer) and should not depend on any outer layers.
* Reference: [Clean Architecture Constitution](constitutions/clean_architecture.md)

## Prerequisites
- [ ] Phase 1 completed: NestJS project initialized with TypeScript
- [ ] Project structure exists

## Task Order
Execute tasks in this exact order:
1. Task 2.1: Flight Entity
2. Task 2.2: Booking Entity & Passenger Value Object
3. Task 2.3: DTOs
4. Task 2.4: Flight ID Generator Service
5. Task 2.5: Flight Deduplicator Service

---

## Task 2.1: Define Flight Entity (Domain Model)

### Details
**File Path**: `flight-search/src/domain/entities/flight.entity.ts`

### Implementation Steps
1. [ ] Create the file with TypeScript class
2. [ ] Add properties with TypeScript types
3. [ ] Add TypeORM decorators for persistence
4. [ ] Add Swagger decorators for API docs
5. [ ] Add business methods

### Expected Code Structure
```typescript
import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Flight {
  @PrimaryColumn()
  @ApiProperty()
  id: string; // Stable flight identifier (hash)

  @Column()
  @ApiProperty()
  carrier: string;

  @Column()
  @ApiProperty()
  flightNo: string;

  @Column()
  @ApiProperty()
  from: string; // IATA code

  @Column()
  @ApiProperty()
  to: string; // IATA code

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  depart: Date;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  arrive: Date;

  @Column()
  @ApiProperty()
  stops: number;

  @Column({ type: 'decimal' })
  @ApiProperty()
  price: number;

  @Column()
  @ApiProperty()
  currency: string;

  @Column('simple-array')
  @ApiProperty()
  providers: string[];

  @Column('jsonb', { nullable: true })
  @ApiProperty()
  providerData: Record<string, any>;

  // Returns duration in minutes
  getDuration(): number {
    return (this.arrive.getTime() - this.depart.getTime()) / (1000 * 60);
  }

  // Comparison logic for deduplication
  isSameFlight(other: Flight): boolean {
    return this.id === other.id;
  }
}
```

### Validation
- No dependencies on outer layers (controllers, services, etc.)
- All TypeScript types are explicit
- All decorators added

---

## Task 2.2: Define Booking Entity & Passenger Value Object

### Subtask 2.2.1: Passenger Value Object
**File Path**: `flight-search/src/domain/value-objects/passenger.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class Passenger {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}
```

### Subtask 2.2.2: Booking Entity
**File Path**: `flight-search/src/domain/entities/booking.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Passenger } from '../value-objects/passenger';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @ApiProperty()
  reference: string;

  @Column()
  @ApiProperty()
  flightId: string;

  @Column('jsonb')
  @ApiProperty({ type: [Passenger] })
  passengers: Passenger[];

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}
```

### Validation
- Both files created at correct paths
- No outer layer dependencies

---

## Task 2.3: Define DTOs for API Requests/Responses

### Subtask 2.3.1: Create Search Flights Request DTO
**File Path**: `flight-search/src/interface/dtos/search-flights.dto.ts`

```typescript
import { IsString, IsInt, Min, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
  PRICE = 'price',
  DURATION = 'duration',
  DEPARTURE = 'departure'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class SearchFlightsDto {
  @ApiProperty({ description: 'Origin IATA code', example: 'DAC' })
  @IsString()
  from: string;

  @ApiProperty({ description: 'Destination IATA code', example: 'DXB' })
  @IsString()
  to: string;

  @ApiProperty({ description: 'Travel date (YYYY-MM-DD)', example: '2026-07-01' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Number of passengers', minimum: 1, example: 2 })
  @IsInt()
  @Min(1)
  passengers: number;

  @ApiPropertyOptional({ enum: SortBy, example: SortBy.PRICE })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ description: 'Maximum number of stops', example: 1 })
  @IsOptional()
  @IsInt()
  maxStops?: number;

  @ApiPropertyOptional({ description: 'List of carrier codes', example: ['AA', 'EK'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  carriers?: string[];

  @ApiPropertyOptional({ description: 'Minimum price', example: 200 })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 500 })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}
```

### Subtask 2.3.2: Create Other DTOs
Create these files with appropriate decorators:
1. `flight-search/src/interface/dtos/create-booking.dto.ts`
2. `flight-search/src/interface/dtos/flight-response.dto.ts`
3. `flight-search/src/interface/dtos/search-response.dto.ts`
4. `flight-search/src/interface/dtos/booking-response.dto.ts`

**Important**: All DTOs must include class-validator and Swagger decorators.

---

## Task 2.4: Implement Stable Flight ID Generation Logic

### File Path
`flight-search/src/domain/services/flight-id-generator.service.ts`

### Implementation Details
1. Create an injectable NestJS service
2. Implement deterministic `generateFlightId` method
3. Hashing logic: SHA-256 hash of carrier, flightNo, and depart time rounded to nearest minute
4. Encode hash as hex or base64

### Expected Code Structure
```typescript
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface FlightData {
  carrier: string;
  flightNo: string;
  depart: Date | string;
}

@Injectable()
export class FlightIdGeneratorService {
  generateFlightId(flightData: FlightData): string {
    // Round depart time to nearest minute to ensure consistency
    const departDate = new Date(flightData.depart);
    departDate.setSeconds(0, 0);
    
    const dataString = `${flightData.carrier}-${flightData.flightNo}-${departDate.toISOString()}`;
    
    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex')
      .slice(0, 32); // 32-char hex string
  }
}
```

---

## Task 2.5: Implement Flight Deduplication Service

### File Path
`flight-search/src/domain/services/flight-deduplicator.service.ts`

### Implementation Logic
1. Group flights by their `id`
2. For each group:
   - Keep flight with lowest price
   - Merge provider arrays from all duplicates
   - Keep all provider raw data
3. Return deduplicated array

### Expected Code Structure
```typescript
import { Injectable } from '@nestjs/common';
import { Flight } from '../entities/flight';

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
        flight.price < min.price ? flight : min
      );

      // Merge providers from all flights in group
      const allProviders = [...new Set(group.flatMap(f => f.providers))];

      // Create result flight
      const resultFlight = { ...lowestPriceFlight };
      resultFlight.providers = allProviders;

      // Merge providerData (combine all raw data)
      resultFlight.providerData = group.reduce((acc, flight) => ({
        ...acc,
        ...flight.providerData
      }), {});

      result.push(resultFlight);
    }

    return result;
  }
}
```

---

## Success Criteria
- [ ] All entities defined with proper TypeScript types
- [ ] DTOs have class-validator and Swagger decorators
- [ ] Flight ID generation is deterministic
- [ ] Deduplication logic correctly handles duplicates, keeping lowest price and merging providers
- [ ] Entities follow Clean Architecture principles (no outer layer dependencies)
- [ ] All files created at correct paths