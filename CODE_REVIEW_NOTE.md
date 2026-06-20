# Flight Search Aggregator - Code Review Guide

Hi there! 👋 Thanks for reviewing my code!

---

## 1. Requirements Met

### ✅ Search Endpoint (`GET /api/flights/search`)
- Query all 3 providers concurrently
- Deduplicate flights (stable ID: carrier + flight number + rounded departure time; keep lowest price)
- Sort/filter by price/duration/stops/carriers/price range
- Meta with completeness info (success/failed providers, "complete"/"partial")

### ✅ Booking Endpoints
- `POST /api/bookings`: Create booking with unique reference
- `GET /api/bookings/:reference`: Retrieve booking by reference

### ✅ Mock Providers
- 3 providers with unique schemas
- Each provider runs in its own separate Docker container
- 10% failure chance for testing fail-open strategy
- Swagger docs for each

### ✅ API Documentation
- Swagger/OpenAPI docs for main app and all providers
- Interactive UI for testing endpoints

---

## 2. Architecture: Clean Architecture

```
flight-search/src/
├── domain/          # Core business logic (no external dependencies)
├── application/     # Use cases & app services
├── infrastructure/  # Adapters (providers, DB)
└── interface/       # Controllers, DTOs
```

---

## 3. Key Files

| File | Purpose |
|------|---------|
| `flight-search/src/application/use-cases/flight-search.service.ts` | Core search logic |
| `flight-search/src/domain/services/flight-deduplicator.service.ts` | Deduplication & lowest price selection |
| `flight-search/src/infrastructure/providers/` | Provider adapters |
| `e2e-test.sh` | External end-to-end tests |

---

## 4. Running the Project

```bash
# Start all services
docker compose up --build

# Access Swagger docs
- Main app: http://localhost:3000/api/docs
- Provider A: http://localhost:3001/api-docs
- Provider B: http://localhost:3002/api-docs
- Provider C: http://localhost:3003/api-docs

# Run tests
cd flight-search && npm run test       # Unit
cd flight-search && npm run test:e2e  # E2E
./e2e-test.sh                          # External E2E testing
```

---

## 5. Design Decisions

- **Fail-open**: Return available results even if some providers fail
- **Provider adapters**: Easy to add new providers via `FlightProvider` interface
- **Stable flight ID**: Ensures consistency across providers

---

## 6. Next Steps (If I had more time)

- Add Redis for search caching
- Add circuit breakers for providers
- Use Supertest instead of bash for E2E
- Add proper logging/monitoring

---

Git history is clean with focused commits!

Thanks! 🚀
