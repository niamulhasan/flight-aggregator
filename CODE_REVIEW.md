# Flight Search Aggregator - Code Review Guide

Hi there! 👋 Thanks for reviewing my code! This document is here to guide you through the project, highlight key decisions, and make your review as smooth as possible.

---

## 1. Project Overview & Requirements Met

Let's start with how the project satisfies all requirements from `REQUIREMENT.md`:

### ✅ Search Endpoint (`GET /api/flights/search`)
- **Query all providers**: Implemented in `flight-search/src/application/use-cases/flight-search.service.ts` → calls all 3 providers concurrently.
- **Unified response**: All flight data mapped to the same `Flight` entity (`flight-search/src/domain/entities/flight.entity.ts`).
- **Stable flight ID**: Generated using carrier, flight number, and departure timestamp (rounded to minute) → `flight-id-generator.service.ts`.
- **Deduplication**: Merges identical flights from different providers, keeps lowest price → `flight-deduplicator.service.ts`.
- **Sorting/Filtering**: Sort by price/duration/departure, filter by stops, carriers, price range → `flight-sorter.service.ts` & `flight-filter.service.ts`.
- **Completeness info**: Response includes meta with which providers succeeded/failed and whether results are complete/partial.

### ✅ Booking Endpoints
- `POST /api/bookings`: Creates a booking with unique reference ID, stores in PostgreSQL → `booking.service.ts` & `booking-reference-generator.service.ts`.
- `GET /api/bookings/:reference`: Retrieves a booking by reference → `booking.service.ts`.

### ✅ Mock Providers
- Each provider has own unique schema, 10% chance of failure to test fail-over strategy → `/provider-a`, `/provider-b`, `/provider-c`.
- Swagger docs for each provider too!

### ✅ Engineering Best Practices
- **Clear separation of concerns**: Follows Clean Architecture (Domain → Application → Infrastructure → Interface).
- **Type-safe**: TypeScript with strict mode enabled.
- **Consistent API design**: Well-documented with Swagger/OpenAPI.
- **Extensible**: Adding new providers is easy (implement `FlightProvider` interface).
- **Testing**: Comprehensive unit tests + external E2E test script.

---

## 2. Architecture Deep Dive

This project uses **Clean Architecture** by Robert C. Martin. Here's what each layer does:

```
flight-search/src/
├── domain/                   # Core business logic, no external dependencies!
│   ├── entities/
│   │   ├── flight.entity.ts  # Core flight model (shared across all providers)
│   │   └── booking.entity.ts # Booking model
│   ├── value-objects/
│   │   └── passenger.ts
│   ├── services/             # Pure business logic services
│   │   ├── flight-id-generator.service.ts
│   │   ├── flight-deduplicator.service.ts
│   │   └── booking-reference-generator.service.ts
│   └── repositories/         # Interfaces for data access
│       └── booking.repository.interface.ts
│
├── application/              # Orchestrates use cases
│   ├── use-cases/
│   │   ├── flight-search.service.ts  # Main search logic
│   │   └── booking.service.ts        # Booking use case
│   ├── services/
│   │   ├── flight-filter.service.ts  # Filter flights by params
│   │   └── flight-sorter.service.ts  # Sort flights
│   └── modules/
│
├── infrastructure/           # External implementations
│   ├── providers/            # Adapter for each provider (A/B/C)
│   │   ├── flight-provider.interface.ts  # Common interface for providers
│   │   ├── provider-a.adapter.ts         # Maps provider A schema to Flight
│   │   ├── provider-b.adapter.ts
│   │   └── provider-c.adapter.ts
│   └── repositories/
│       └── booking.repository.ts  # PostgreSQL TypeORM repository
│
└── interface/                # HTTP layer & DTOs
    ├── controllers/         # NestJS controllers
    │   ├── search.controller.ts
    │   └── booking.controller.ts
    └── dtos/                # Request/response validation
        ├── search-flights.dto.ts
        ├── create-booking.dto.ts
        └── search-response.dto.ts
```

---

## 3. Key Files to Review

| File Path | Purpose |
|-----------|---------|
| `flight-search/src/application/use-cases/flight-search.service.ts` | The heart of the search logic! |
| `flight-search/src/domain/services/flight-deduplicator.service.ts` | How duplicates are handled! |
| `flight-search/src/infrastructure/providers/` | The provider adapters! |
| `e2e-test.sh` | External end-to-end test script! |
| All `*.spec.ts` files in `__tests__` folders | Unit tests! |

---

## 4. Running the Project

### Quick Start
From project root:
```bash
# Starts all services (Flight App, Postgres, Provider A/B/C)
docker compose up --build

# Access the services
- Main App: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
```

### Running Tests
```bash
cd flight-search
npm run test        # Unit tests
npm run test:cov    # Coverage
npm run test:e2e    # External E2E (runs ./e2e-test.sh)

# Or from project root
./e2e-test.sh
```

---

## 5. Design Decisions & Rationale

Here are some key choices I made and why:

### Clean Architecture
I chose Clean Architecture to keep core business logic isolated from external concerns (NestJS, PostgreSQL, etc.). This makes it easy to test, maintain, and swap out providers without affecting the domain.

### Fail-Open Strategy
The main app continues even if some providers fail! Why? Because getting *some* results is better than none for a flight search aggregator! The response has meta info so the frontend knows which providers failed.

### Flight Deduplication
To avoid showing the same flight from 2 providers, I:
1. Created a stable ID using carrier, flight number, and departure time rounded to the minute
2. If same flight exists in results, keep the lowest price!

### Provider Adapters
Each provider has unique schema, so each has an adapter that implements the same `FlightProvider` interface! Adding a new provider is easy → just create a new adapter that maps their schema to `Flight`!

---

## 6. Areas I'd Improve With More Time

If I had more time, here's what I'd do:
1. **Cache frequent searches**: Add Redis to cache search results for 1-2 minutes!
2. **Circuit Breakers**: Add a circuit breaker pattern for provider calls to prevent cascading failures!
3. **More comprehensive E2E testing**: Use Supertest instead of bash script!
4. **Better error handling in FlightSearchService**: More granular error messages for the meta!
5. **Performance optimization**: Pagination for large search results!
6. **Logging/Monitoring**: Add proper logging (Winston) and monitoring!

---

## 7. Git History & Commit Structure

I kept commits clean and focused:
- Each commit has a clear, descriptive message!
- Commits are small and focused on one change each!

You can see the full history with `git log --oneline`.

---

Thanks again for your time! I'm happy to answer any questions! 🚀
