# Phase 5: Booking Use Case & API Plan

## Description
This phase implements the booking functionality, including repository, business logic, and API endpoints.

## Clean Architecture Context
The booking service belongs to the **Use Cases** layer, repository to **Infrastructure**, and controller to **Interface Adapters**.
* Reference: [Clean Architecture Constitution](constitutions/clean_architecture.md)

## Prerequisites
- [ ] Phase 1 completed: NestJS and TypeORM setup
- [ ] Phase 2 completed: Booking entity defined

## Task Order
Execute tasks in this exact order:
1. Task 5.1: Implement BookingReferenceGeneratorService
2. Task 5.2: Implement BookingRepository
3. Task 5.3: Implement BookingService
4. Task 5.4: Create BookingController
5. Task 5.5: Create BookingModule

---

## Task 5.1: Implement BookingReferenceGeneratorService

### File Path
`flight-search/src/domain/services/booking-reference-generator.service.ts`

### Implementation Steps
1. [ ] Create the service:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import * as crypto from 'crypto';

   @Injectable()
   export class BookingReferenceGeneratorService {
     generateReference(): string {
       const timestamp = Date.now().toString(36).toUpperCase();
       const random = crypto.randomBytes(3).toString('hex').toUpperCase();
       return `FB-${timestamp}${random}`;
     }
   }
   ```

### Validation
- [ ] Generates unique, human-readable references (e.g., FB-ABC123)

---

## Task 5.2: Implement BookingRepository

### File Path
`flight-search/src/infrastructure/repositories/booking.repository.ts`

### Implementation Steps
1. [ ] Create the repository interface first:
   ```typescript
   // flight-search/src/domain/repositories/booking.repository.interface.ts
   import { Booking } from '../entities/booking';

   export interface IBookingRepository {
     save(booking: Booking): Promise<Booking>;
     findByReference(reference: string): Promise<Booking | null>;
   }
   ```

2. [ ] Create the TypeORM implementation:
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { InjectRepository } from '@nestjs/typeorm';
   import { Repository } from 'typeorm';
   import { Booking } from '../../domain/entities/booking';
   import { IBookingRepository } from '../../domain/repositories/booking.repository.interface';

   @Injectable()
   export class BookingRepository implements IBookingRepository {
     constructor(
       @InjectRepository(Booking)
       private readonly repository: Repository<Booking>,
     ) {}

     async save(booking: Booking): Promise<Booking> {
       return this.repository.save(booking);
     }

     async findByReference(reference: string): Promise<Booking | null> {
       return this.repository.findOneBy({ reference });
     }
   }
   ```

### Validation
- [ ] Implements repository interface
- [ ] Supports save and findByReference operations

---

## Task 5.3: Implement BookingService

### File Path
`flight-search/src/application/use-cases/booking.service.ts`

### Implementation Steps
1. [ ] Create the service:
   ```typescript
   import { Injectable, NotFoundException } from '@nestjs/common';
   import { Booking } from '../../domain/entities/booking';
   import { Passenger } from '../../domain/value-objects/passenger';
   import { BookingReferenceGeneratorService } from '../../domain/services/booking-reference-generator.service';
   import { IBookingRepository } from '../../domain/repositories/booking.repository.interface';
   import {
     CreateBookingDto,
     BookingResponseDto,
   } from '../../interface/dtos/booking.dto';

   @Injectable()
   export class BookingService {
     constructor(
       private readonly repository: IBookingRepository,
       private readonly referenceGenerator: BookingReferenceGeneratorService,
     ) {}

     async createBooking(dto: CreateBookingDto): Promise<BookingResponseDto> {
       const booking = new Booking();
       booking.reference = this.referenceGenerator.generateReference();
       booking.flightId = dto.flightId;
       booking.passengers = dto.passengers.map((p) => ({
         firstName: p.firstName,
         lastName: p.lastName,
         email: p.email,
       }));

       const savedBooking = await this.repository.save(booking);
       return this.toBookingResponseDto(savedBooking);
     }

     async getBookingByReference(reference: string): Promise<BookingResponseDto> {
       const booking = await this.repository.findByReference(reference);

       if (!booking) {
         throw new NotFoundException(`Booking with reference ${reference} not found`);
       }

       return this.toBookingResponseDto(booking);
     }

     private toBookingResponseDto(booking: Booking): BookingResponseDto {
       return {
         id: booking.id,
         reference: booking.reference,
         flightId: booking.flightId,
         passengers: booking.passengers,
         createdAt: booking.createdAt.toISOString(),
         updatedAt: booking.updatedAt.toISOString(),
       };
     }
   }
   ```

### Validation
- [ ] Creates bookings with unique references
- [ ] Retrieves bookings by reference
- [ ] Throws NotFoundException for missing bookings

---

## Task 5.4: Create BookingController

### File Path
`flight-search/src/interface/controllers/booking.controller.ts`

### Implementation Steps
1. [ ] Create the controller:
   ```typescript
   import {
     Controller,
     Post,
     Get,
     Param,
     Body,
     ValidationPipe,
     HttpCode,
     HttpStatus,
   } from '@nestjs/common';
   import {
     ApiTags,
     ApiOperation,
     ApiBody,
     ApiParam,
     ApiCreatedResponse,
     ApiOkResponse,
     ApiNotFoundResponse,
   } from '@nestjs/swagger';
   import { BookingService } from '../../application/use-cases/booking.service';
   import {
     CreateBookingDto,
     BookingResponseDto,
   } from '../dtos/booking.dto';

   @ApiTags('bookings')
   @Controller('api/bookings')
   export class BookingController {
     constructor(private readonly bookingService: BookingService) {}

     @Post()
     @HttpCode(HttpStatus.CREATED)
     @ApiOperation({ summary: 'Create a new booking' })
     @ApiBody({ type: CreateBookingDto })
     @ApiCreatedResponse({
       description: 'Booking created successfully',
       type: BookingResponseDto,
     })
     async createBooking(
       @Body(ValidationPipe) dto: CreateBookingDto,
     ): Promise<BookingResponseDto> {
       return this.bookingService.createBooking(dto);
     }

     @Get(':reference')
     @ApiOperation({ summary: 'Get a booking by reference' })
     @ApiParam({ name: 'reference', description: 'Booking reference' })
     @ApiOkResponse({
       description: 'Booking found',
       type: BookingResponseDto,
     })
     @ApiNotFoundResponse({ description: 'Booking not found' })
     async getBooking(
       @Param('reference') reference: string,
     ): Promise<BookingResponseDto> {
       return this.bookingService.getBookingByReference(reference);
     }
   }
   ```

### Validation
- [ ] Implements `POST /api/bookings` and `GET /api/bookings/:reference`
- [ ] Complete Swagger documentation
- [ ] Uses validation pipe for DTO

---

## Task 5.5: Create BookingModule

### File Path
`flight-search/src/application/booking.module.ts`

### Implementation Steps
1. [ ] Create the DTOs first:
   ```typescript
   // flight-search/src/interface/dtos/booking.dto.ts
   import { IsString, IsArray, ValidateNested, IsEmail } from 'class-validator';
   import { Type } from 'class-transformer';
   import { ApiProperty } from '@nestjs/swagger';

   export class CreatePassengerDto {
     @ApiProperty({ example: 'John' })
     @IsString()
     firstName: string;

     @ApiProperty({ example: 'Doe' })
     @IsString()
     lastName: string;

     @ApiProperty({ example: 'john@example.com' })
     @IsEmail()
     email: string;
   }

   export class CreateBookingDto {
     @ApiProperty({ description: 'Stable flight ID' })
     @IsString()
     flightId: string;

     @ApiProperty({ type: [CreatePassengerDto] })
     @IsArray()
     @ValidateNested({ each: true })
     @Type(() => CreatePassengerDto)
     passengers: CreatePassengerDto[];
   }

   export class PassengerResponseDto {
     @ApiProperty()
     firstName: string;

     @ApiProperty()
     lastName: string;

     @ApiProperty()
     email: string;
   }

   export class BookingResponseDto {
     @ApiProperty()
     id: string;

     @ApiProperty()
     reference: string;

     @ApiProperty()
     flightId: string;

     @ApiProperty({ type: [PassengerResponseDto] })
     passengers: PassengerResponseDto[];

     @ApiProperty()
     createdAt: string;

     @ApiProperty()
     updatedAt: string;
   }
   ```

2. [ ] Create the module:
   ```typescript
   import { Module } from '@nestjs/common';
   import { TypeOrmModule } from '@nestjs/typeorm';
   import { Booking } from '../domain/entities/booking';
   import { BookingService } from './use-cases/booking.service';
   import { BookingController } from '../interface/controllers/booking.controller';
   import { BookingReferenceGeneratorService } from '../domain/services/booking-reference-generator.service';
   import { BookingRepository } from '../infrastructure/repositories/booking.repository';
   import { IBookingRepository } from '../domain/repositories/booking.repository.interface';

   @Module({
     imports: [TypeOrmModule.forFeature([Booking])],
     providers: [
       BookingService,
       BookingReferenceGeneratorService,
       {
         provide: IBookingRepository,
         useClass: BookingRepository,
       },
     ],
     controllers: [BookingController],
     exports: [BookingService],
   })
   export class BookingModule {}
   ```

3. [ ] Update `app.module.ts` to import `BookingModule`:
   ```typescript
   @Module({
     imports: [
       ConfigModule.forRoot(...),
       TypeOrmModule.forRootAsync(...),
       SearchModule,
       BookingModule, // <-- Add this
     ],
   })
   export class AppModule {}
   ```

### Validation
- [ ] All DTOs created with validation
- [ ] Module imports TypeOrmModule
- [ ] Repository interface and implementation registered
- [ ] Added to `AppModule`

---

## Success Criteria
- [ ] Bookings can be created with POST /api/bookings
- [ ] Bookings can be retrieved with GET /api/bookings/:reference
- [ ] Booking references are unique and human-readable
- [ ] All endpoints documented with Swagger
- [ ] Proper error handling for invalid inputs and not found bookings