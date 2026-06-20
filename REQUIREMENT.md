# **Senior Software Engineer (Backend)**

Thank you for your interest in joining iBox Lab. Below is a practical take-home exercise. This exercise is intentionally open-ended. We are interested in how you approach system design, scalability, reliability, maintainability, and engineering trade-offs, not just whether the code works.

**Time expectation:** 4 to 8 hours. 
Please do **not** over-build. We value architectural judgment and correct fundamentals over breadth. If you run out of time, prioritize, and clearly document what you'd do next and why.

**Submission deadline:** 72 Hours after receiving this assignment.

## The Scenario - Flight Search Aggregator

You are building the backend service powering a flight search experience. When a user performs a search, your service must gather flight data from multiple providers, combine the results into a single response. No authentication, payments, or frontend needed. Focus on the API and the architecture.

## The mock providers

Simulate **multiple providers** as local mock endpoints or services that return the data shown below, each in its **own response schema.** You may add more flights, but keep the ones below the duplicates and price differences matter.

**Provider A**

```json
{ "flights": [
  { "carrier": "AA", "from": "DAC", "to": "DXB", "depart": "2026-07-01T08:00:00", "arrive": "2026-07-01T12:30:00", "stops": 0, "fare_usd": 320.00, "flight_no": "AA101" },
  { "carrier": "AA", "from": "DAC", "to": "DXB", "depart": "2026-07-01T22:10:00", "arrive": "2026-07-02T02:40:00", "stops": 0, "fare_usd": 280.00, "flight_no": "AA205" },
  { "carrier": "BS", "from": "DAC", "to": "DXB", "depart": "2026-07-01T09:15:00", "arrive": "2026-07-01T15:00:00", "stops": 1, "fare_usd": 310.00, "flight_no": "BS220" },
  { "carrier": "EK", "from": "DAC", "to": "DXB", "depart": "2026-07-01T03:45:00", "arrive": "2026-07-01T06:50:00", "stops": 0, "fare_usd": 410.00, "flight_no": "EK585" }
]}
```

**Provider B**

```json
{ "data": [
  { "airline_code": "BS", "origin": "DAC", "destination": "DXB", "departure_time": "2026-07-01 09:15", "arrival_time": "2026-07-01 15:00", "segments": 1, "price": { "amount": 295, "currency": "USD" }, "number": "BS220" },
  { "airline_code": "BS", "origin": "DAC", "destination": "DXB", "departure_time": "2026-07-01 14:30", "arrival_time": "2026-07-01 19:20", "segments": 1, "price": { "amount": 265, "currency": "USD" }, "number": "BS118" },
  { "airline_code": "EK", "origin": "DAC", "destination": "DXB", "departure_time": "2026-07-01 03:45", "arrival_time": "2026-07-01 06:50", "segments": 0, "price": { "amount": 399, "currency": "USD" }, "number": "EK585" }
]}
```

**Provider C**

```json
{ "results": [
  { "iata": "AA", "route": { "src": "DAC", "dst": "DXB" }, "times": { "dep": 1782892800, "arr": 1782909000 }, "layovers": 0, "total_price": 335, "currency": "USD", "code": "AA101" },
  { "iata": "CJ", "route": { "src": "DAC", "dst": "DXB" }, "times": { "dep": 1782885600, "arr": 1782903600 }, "layovers": 2, "total_price": 270, "currency": "USD", "code": "CJ300" },
  { "iata": "EK", "route": { "src": "DAC", "dst": "DXB" }, "times": { "dep": 1782877500, "arr": 1782888600 }, "layovers": 0, "total_price": 405, "currency": "USD", "code": "EK585" }
]}
```

## What to build - **Requirements**

### 1. Search endpoint

`GET /api/flights/search?from=DAC&to=DXB&date=2026-07-01&passengers=2`

- Query all providers
- Return a single unified response
- Expose a stable flight identifier suitable for downstream operations
- Support sorting and filtering
- Present results in a way that avoids unnecessary duplication and provides the best possible user experience

The response should also communicate enough information for consumers to understand the completeness of the returned results.

### 2. Booking

`POST /api/bookings` 

- Store a booking with a flight identifier + passenger details
- Return booking details with a reference identifier

 `GET /api/bookings/{reference}` 

- Retrieve Booking with reference

## Engineering expectations

- Clear separation of concerns
- Maintainable architecture
- Consistent API design and documentation
- Extensibility
- Testing
- Documentation: Provide `README.md` and `ARCHITECTURE.md`

## Submission

- A **public GitHub/BitBucket** repo link send it to `career@iboxlab.com`

## A note on AI tools

You may use AI coding assistants, we expect senior engineers to use them well. **But** you must fully understand and defend every architectural decision in a follow-up technical discussion.