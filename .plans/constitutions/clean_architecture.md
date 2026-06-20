# Clean Architecture Constitution

This document defines the immutable architectural laws for the Flight Search Aggregator project.

## 1. Clean Architecture Principles

The project MUST follow Clean Architecture with the following layers (from inner to outer):

- **Entities**: Enterprise business rules (Flight, Booking models)
- **Use Cases**: Application-specific business rules
- **Interface Adapters**: Converters (providers, controllers, presenters)
- **Frameworks & Drivers**: NestJS, PostgreSQL, Docker, external providers

### Dependency Rule
- Dependencies MUST point inward only
- Inner layers MUST NOT depend on outer layers
- Use interfaces to decouple layers

## 2. SOLID Principles

The code MUST adhere to SOLID principles:

- **S**: Single Responsibility Principle - Each class/module has one purpose
- **O**: Open/Closed Principle - Open for extension, closed for modification
- **L**: Liskov Substitution Principle - Subtypes must be substitutable
- **I**: Interface Segregation Principle - Clients should not depend on interfaces they don't use
- **D**: Dependency Inversion Principle - Depend on abstractions, not concretions

## 3. Dependency Injection

- MUST use NestJS's built-in DI container
- All dependencies MUST be injected
- No `new` keyword for service instantiation (except for DTOs and value objects)

## 4. Provider Adapters

- MUST implement a common `FlightProvider` interface
- Each provider MUST have its own adapter class
- No provider-specific logic outside adapter classes
- Easy to add new providers without changing core logic

## 5. Testing

- MUST write unit tests for use cases and entities
- MUST write integration tests for API endpoints
- MUST mock external dependencies in tests

## 6. Docker & Containers

- Each service (main app, 3 providers, PostgreSQL) MUST run in separate containers
- Use Docker Compose for orchestration
- All containers MUST be able to communicate via Docker network

## 7. API Documentation

- MUST use Swagger/OpenAPI for API documentation
- All endpoints MUST be documented
- All DTOs MUST have Swagger decorators

## 8. Error Handling

- Provider failures MUST be handled gracefully (fail open)
- MUST log errors appropriately
- API responses MUST include error details when appropriate

## 9. Flight Deduplication

- MUST generate stable flight identifiers
- MUST deduplicate flights across providers
- For duplicate flights, MUST keep the one with the lowest price
- MUST track which providers offer each flight

## 10. Immutability

Entities and DTOs SHOULD be immutable where possible
