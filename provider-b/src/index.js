const express = require('express');
const cors = require('cors');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: 'B' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Provider B API - Full implementation coming in Phase 3' });
});

app.listen(PORT, () => {
  console.log(`Provider B running on http://localhost:${PORT}`);
});
