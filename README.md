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

- **Framework**: NestJS 11+
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
2. Start all services:
   ```bash
   docker compose up --build
   ```
3. Access the services:
   - Main App: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs
   - Provider A: http://localhost:3001/api-docs
   - Provider B: http://localhost:3002/api-docs
   - Provider C: http://localhost:3003/api-docs

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
