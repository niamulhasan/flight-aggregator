# Flight Search Aggregator Implementation Plan

## Overview

This plan outlines the implementation of a flight search aggregator using NestJS, Docker, and Clean Architecture principles.

## Technology Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **API Docs**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest

## Phase 1: Project Setup & Infrastructure

- [x] Task 1.1: Initialize NestJS project structure with TypeScript
- [x] Task 1.2: Set up Docker Compose configuration (main app, 3 mock providers, PostgreSQL)
- [x] Task 1.3: Configure NestJS with TypeORM and PostgreSQL
- [x] Task 1.4: Set up Swagger/OpenAPI documentation
- [x] Task 1.5: Configure environment variables and validation

## Phase 2: Core Domain & Entities

- [x] Task 2.1: Define Flight entity (domain model)
- [x] Task 2.2: Define Booking entity (domain model)
- [x] Task 2.3: Define DTOs for API requests/responses
- [x] Task 2.4: Implement stable flight ID generation logic
- [x] Task 2.5: Implement flight deduplication service

## Phase 3: Mock Providers Implementation

- [x] Task 3.1: Create Provider A mock service (Docker container) with Swagger docs
- [x] Task 3.2: Create Provider B mock service (Docker container) with Swagger docs
- [x] Task 3.3: Create Provider C mock service (Docker container) with Swagger docs
- [x] Task 3.4: Define common FlightProvider interface
- [x] Task 3.5: Implement Provider A adapter
- [x] Task 3.6: Implement Provider B adapter
- [x] Task 3.7: Implement Provider C adapter

## Phase 4: Search Use Case & API

- [x] Task 4.1: Implement FlightSearchService (orchestrates provider calls in parallel)
- [x] Task 4.2: Implement provider failure handling (fail open strategy)
- [x] Task 4.3: Implement sorting logic (by price, duration, departure time)
- [x] Task 4.4: Implement filtering logic (by stops, carrier, price range)
- [x] Task 4.5: Create SearchController with GET /api/flights/search endpoint
- [x] Task 4.6: Add completeness information to search response

## Phase 5: Booking Use Case & API

- [x] Task 5.1: Implement BookingRepository (TypeORM)
- [x] Task 5.2: Implement BookingService (create and retrieve bookings)
- [x] Task 5.3: Create BookingController with POST /api/bookings endpoint
- [x] Task 5.4: Create BookingController with GET /api/bookings/:reference endpoint
- [x] Task 5.5: Implement booking reference generation

## Phase 6: Testing

- [x] Task 6.1: Write unit tests for flight deduplication logic
- [x] Task 6.2: Write unit tests for provider adapters
- [x] Task 6.3: Write unit tests for use cases
- [ ] Task 6.4: Write integration tests for search API
- [ ] Task 6.5: Write integration tests for booking API

## Phase 7: Documentation

- [x] Task 7.1: Write README.md (setup, run, API overview)
- [x] Task 7.2: Write ARCHITECTURE.md (design decisions, trade-offs, future improvements)

## Success Criteria

- [x] All requirements from REQUIREMENT.md are met
- [x] Clean Architecture principles are followed
- [x] All tests pass
- [x] Docker Compose spins up all services successfully
- [x] Swagger documentation is complete and accessible
