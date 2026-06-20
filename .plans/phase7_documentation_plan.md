# Phase 7: Documentation Plan

## Description
This phase covers writing the README.md and ARCHITECTURE.md files.

## Prerequisites
- [ ] Phase 1-6 completed: All features implemented and tested

## Task Order
Execute tasks in this exact order:
1. Task 7.1: Write README.md
2. Task 7.2: Write ARCHITECTURE.md

---

## Task 7.1: Write README.md

### File Path
`README.md` (project root)

### Implementation Steps
1. [ ] Create comprehensive README:
   ```markdown
   # Flight Search Aggregator

   A flight search aggregator built with NestJS, TypeScript, and Clean Architecture.

   ## Features

   - ✈️ Search flights across multiple providers
   - 🎯 Deduplicate identical flights from different providers
   - 📊 Sort flights by price, duration, or departure time
   - 🔍 Filter by stops, carriers, and price range
   - 📝 Create and retrieve bookings
   - 🐳 Fully Dockerized
   - 📚 Swagger API documentation
   - 🔒 Type-safe with TypeScript

   ## Tech Stack

   - **Framework**: NestJS 10+
   - **Language**: TypeScript 5+
   - **Database**: PostgreSQL 15+
   - **ORM**: TypeORM
   - **API Docs**: Swagger/OpenAPI
   - **Containerization**: Docker & Docker Compose
   - **Testing**: Jest

   ## System Architecture

   - Clean Architecture with four layers:
   1. Entities (Domain) - Core business models
   2. Use Cases - Application business logic
   3. Interface Adapters - Converters (Controllers, Repositories, Providers)
   4. Frameworks & Drivers - NestJS, PostgreSQL, Docker

   ## Getting Started

   ### Prerequisites

   - Node.js 18+
   - Docker & Docker Compose

   ### Installation & Running

   1. Clone the repository
   2. Copy environment file:
      ```bash
      cp .env.example .env
      ```
   3. Start all services:
      ```bash
      docker-compose up --build
      ```
   4. Access the services:
      - Main App: http://localhost:3000
      - Swagger Docs: http://localhost:3000/api/docs
      - Provider A: http://localhost:3001/api/docs
      - Provider B: http://localhost:3002/api/docs
      - Provider C: http://localhost:3003/api/docs

   ## API Endpoints

   ### Flights

   - `GET /api/flights/search` - Search flights

     Query Parameters:
     - `from` (required) - Origin IATA code (e.g., DAC)
     - `to` (required) - Destination IATA code (e.g., DXB)
     - `date` (required) - Travel date (YYYY-MM-DD)
     - `passengers` (required) - Number of passengers
     - `sortBy` - Sort by price/duration/departure
     - `sortOrder` - asc/desc
     - `maxStops` - Maximum number of stops
     - `carriers` - List of allowed carriers
     - `minPrice` - Minimum price
     - `maxPrice` - Maximum price

   ### Bookings

   - `POST /api/bookings` - Create a new booking
   - `GET /api/bookings/:reference` - Get a booking by reference

   ## Example Usage

   ```bash
   # Search flights
   curl "http://localhost:3000/api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2"

   # Create booking
   curl -X POST http://localhost:3000/api/bookings \
     -H "Content-Type: application/json" \
     -d '{
       "flightId": "abc123",
       "passengers": [
         {"firstName": "John", "lastName": "Doe", "email": "john@example.com"}
       ]
     }'
   ```

   ## Running Tests

   ```bash
   # Run all tests
   npm run test

   # Run e2e tests
   npm run test:e2e

   # Run tests with coverage
   npm run test:cov
   ```

   ## Project Structure

   ```
   .
   ├── flight-search/          # Main NestJS application
   │   ├── src/
   │   │   ├── domain/      # Entities, value objects, domain services
   │   │   ├── application/ # Use cases, application services
   │   │   ├── infrastructure/ # Repositories, providers
   │   │   └── interface/   # Controllers, DTOs
   │   └── test/
   ├── provider-a/           # Mock Provider A
   ├── provider-b/           # Mock Provider B
   ├── provider-c/           # Mock Provider C
   ├── docker-compose.yml
   └── README.md
   ```

   ## License

   MIT
   ```

---

## Task 7.2: Write ARCHITECTURE.md

### File Path
`ARCHITECTURE.md` (project root)

### Implementation Steps
1. [ ] Create detailed architecture documentation:
   ```markdown
   # Flight Search Aggregator Architecture

   This document describes the architecture, design decisions, trade-offs, and future improvements for the Flight Search Aggregator.

   ## Clean Architecture Overview

   We follow Clean Architecture principles to ensure maintainability, testability, and separation of concerns.

   ```
   ┌─────────────────────────────────┐
   │      Frameworks & Drivers       │  ← NestJS, Express, PostgreSQL
   ├─────────────────────────────────┤
   │    Interface Adapters          │  ← Controllers, Repositories, Providers
   ├─────────────────────────────────┤
   │       Use Cases              │  ← Flight Search, Booking
   ├─────────────────────────────────┤
   │        Entities              │  ← Flight, Booking
   └─────────────────────────────────┘
   ```

   **Dependency Rule**: Dependencies point inward only. Inner layers know nothing about outer layers.

   ## Design Decisions

   ### 1. Clean Architecture with NestJS

   **Why?**
   - Enables clear separation of concerns
   - Makes code more testable
   - Improves maintainability
   - Easier to change technologies later

   ### 2. TypeScript

   **Why?**
   - Type safety catches bugs at compile time
   - Better IDE support and refactoring
   - Self-documenting code

   ### 3. PostgreSQL with TypeORM

   **Why?**
   - Robust, production-ready
   - Type safety with TypeORM
   - Migrations support
   - Easy to use with NestJS

   ### 4. Docker & Docker Compose

   **Why?**
   - Consistent environments across dev/prod
   - Easy to run locally
   - All services isolated in containers

   ### 5. Flight Deduplication Strategy

   **How?**
   - Generate stable flight ID from: carrier + flightNo + depart time (rounded to minute)
   - Hash with SHA-256 → Base64 encoded
   - For duplicates, keep flight with lowest price
   - Merge provider info from all providers

   ### 6. Provider Failure Handling

   **Fail-Open Strategy**

   **Why?** Better user experience - still get results even if some providers fail

   How:
   - Call providers in parallel
   - Catch errors individually
   - Track success/failure in response metadata
   - Still return available results

   ## System Architecture Diagram

   ```
                          ┌──────────────┐
                          │   Client     │
                          └──────┬───────┘
                                 │
                                 ▼
                   ┌────────────────────────────┐
                   │   Flight Search API   │  NestJS on 3000
                   └──────────┬─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         ┌────────┴───┐    ┌─────┴─────┐   ┌─────┴──────┐
         │Provider A │    │Provider B │   │Provider C │
         │  3001   │    │  3002   │   │  3003    │
         └──────────┘    └───────────┘   └────────────┘
              │                │                 │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   PostgreSQL DB    │
                    │     5432         │
                    └──────────────────┘
   ```

   ## Key Components

   ### Providers & Adapters

   Each provider has:
   - Mock service returning predefined data
   - Adapter converting provider-specific schema to unified Flight
   - Common FlightProvider interface

   ### Search Service

   Orchestrates:
   - Parallel provider calls
   - Deduplication
   - Filtering
   - Sorting
   - Response formatting with completeness info

   ### Booking Service

   - Generates unique booking references
   - Stores/retrieves from PostgreSQL
   - Returns booking responses

   ## Trade-Offs

   | Decision | Pros | Cons |
   |---------|------|------|
   | Clean Architecture | Testable, maintainable | More files/setup |
   | Fail-open strategy | Better UX | Results may be incomplete |
   | PostgreSQL | Robust, production-ready | More complex than SQLite |
   | SHA-256 for flight IDs | Stable, collision-resistant | Slightly more compute |

   ## Future Improvements

   Short Term:
   - Add Redis caching for search results
   - Add rate limiting
   - Add authentication/authorization
   - More comprehensive error handling
   - Improved logging & monitoring

   Medium Term:
   - Add more providers
   - Add pagination for search results
   - Database migrations
   - CI/CD pipeline
   - Kubernetes deployment

   Long Term:
   - Event-driven architecture
   - Separate read/write models (CQRS)
   - Machine learning for pricing
   - Multi-region deployment

   ## License

   MIT
   ```

---

## Success Criteria
- [ ] README.md is comprehensive and easy to follow
- [ ] ARCHITECTURE.md explains all design decisions clearly
- [ ] Both files are well-structured and professional