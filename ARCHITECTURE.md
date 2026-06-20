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
         │               │                 │
         └───────────────┼─────────────────┘
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
|----------|------|------|
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
