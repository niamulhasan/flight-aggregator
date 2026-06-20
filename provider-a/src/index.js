const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Provider A Flight Search API',
      version: '1.0.0',
      description: 'Mock flight search provider with Provider A schema'
    },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: ['src/index.js']
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors());
app.use(express.json());

// Mock Flights Data
const MOCK_FLIGHTS = {
  flights: [
    { carrier: 'AA', from: 'DAC', to: 'DXB', depart: '2026-07-01T08:00:00', arrive: '2026-07-01T12:30:00', stops: 0, fare_usd: 320.00, flight_no: 'AA101' },
    { carrier: 'AA', from: 'DAC', to: 'DXB', depart: '2026-07-01T22:10:00', arrive: '2026-07-02T02:40:00', stops: 0, fare_usd: 280.00, flight_no: 'AA205' },
    { carrier: 'BS', from: 'DAC', to: 'DXB', depart: '2026-07-01T09:15:00', arrive: '2026-07-01T15:00:00', stops: 1, fare_usd: 310.00, flight_no: 'BS220' },
    { carrier: 'EK', from: 'DAC', to: 'DXB', depart: '2026-07-01T03:45:00', arrive: '2026-07-01T06:50:00', stops: 0, fare_usd: 410.00, flight_no: 'EK585' }
  ]
};

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     description: Check service health
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: 'A' });
});

/**
 * @openapi
 * /api/flights:
 *   get:
 *     tags:
 *       - Flights
 *     description: Search flights (mock response)
 *     parameters:
 *       - name: from
 *         in: query
 *         description: Origin IATA code
 *         required: true
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         description: Destination IATA code
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         description: Travel date (YYYY-MM-DD)
 *         required: true
 *         schema:
 *           type: string
 *       - name: passengers
 *         in: query
 *         description: Number of passengers
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with Provider A's flight schema
 */
app.get('/api/flights', (req, res) => {
  // 10% chance of failure
  if (Math.random() < 0.1) {
    console.log('Provider A: Simulating failure');
    return res.status(500).json({ error: 'Internal server error', provider: 'A' });
  }

  const { from, to, date, passengers } = req.query;
  // Just filter simple by from/to for mock
  const filteredFlights = MOCK_FLIGHTS.flights.filter(
    flight => flight.from === from && flight.to === to
  );
  res.json({ flights: filteredFlights.length > 0 ? filteredFlights : MOCK_FLIGHTS.flights });
});

app.listen(PORT, () => {
  console.log(`Provider A running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
