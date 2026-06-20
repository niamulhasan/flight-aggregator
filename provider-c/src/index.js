const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3003;

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Provider C Flight Search API',
      version: '1.0.0',
      description: 'Mock flight search provider with Provider C schema'
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
  results: [
    { iata: 'AA', route: { src: 'DAC', dst: 'DXB' }, times: { dep: 1782892800, arr: 1782909000 }, layovers: 0, total_price: 335, currency: 'USD', code: 'AA101' },
    { iata: 'CJ', route: { src: 'DAC', dst: 'DXB' }, times: { dep: 1782885600, arr: 1782903600 }, layovers: 2, total_price: 270, currency: 'USD', code: 'CJ300' },
    { iata: 'EK', route: { src: 'DAC', dst: 'DXB' }, times: { dep: 1782877500, arr: 1782888600 }, layovers: 0, total_price: 405, currency: 'USD', code: 'EK585' }
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
  res.json({ status: 'ok', provider: 'C' });
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
 *         description: Successful response with Provider C's flight schema
 */
app.get('/api/flights', (req, res) => {
  // 10% chance of failure
  if (Math.random() < 0.1) {
    console.log('Provider C: Simulating failure');
    return res.status(500).json({ error: 'Internal server error', provider: 'C' });
  }

  const { from, to, date, passengers } = req.query;
  const filteredFlights = MOCK_FLIGHTS.results.filter(
    flight => flight.route.src === from && flight.route.dst === to
  );
  res.json({ results: filteredFlights.length > 0 ? filteredFlights : MOCK_FLIGHTS.results });
});

app.listen(PORT, () => {
  console.log(`Provider C running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
