const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3002;

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Provider B Flight Search API',
      version: '1.0.0',
      description: 'Mock flight search provider with Provider B schema'
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
  data: [
    { airline_code: 'BS', origin: 'DAC', destination: 'DXB', departure_time: '2026-07-01 09:15', arrival_time: '2026-07-01 15:00', segments: 1, price: { amount: 295, currency: 'USD' }, number: 'BS220' },
    { airline_code: 'BS', origin: 'DAC', destination: 'DXB', departure_time: '2026-07-01 14:30', arrival_time: '2026-07-01 19:20', segments: 1, price: { amount: 265, currency: 'USD' }, number: 'BS118' },
    { airline_code: 'EK', origin: 'DAC', destination: 'DXB', departure_time: '2026-07-01 03:45', arrival_time: '2026-07-01 06:50', segments: 0, price: { amount: 399, currency: 'USD' }, number: 'EK585' }
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
  res.json({ status: 'ok', provider: 'B' });
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
 *         description: Successful response with Provider B's flight schema
 */
app.get('/api/flights', (req, res) => {
  const { from, to, date, passengers } = req.query;
  const filteredFlights = MOCK_FLIGHTS.data.filter(
    flight => flight.origin === from && flight.destination === to
  );
  res.json({ data: filteredFlights.length > 0 ? filteredFlights : MOCK_FLIGHTS.data });
});

app.listen(PORT, () => {
  console.log(`Provider B running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
