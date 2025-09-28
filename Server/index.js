require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
// app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
const registerRoutes = require('./routes/register');
const diveRoutes = require('./routes/dives');
const diveSitesRoutes = require('./routes/dive-sites');
app.use('/', registerRoutes);
app.use('/', diveRoutes);
app.use('/', diveSitesRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// DB health endpoint
const { getPool } = require('./db');
app.get('/db/health', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW() as now');
    res.json({ status: 'OK', now: result.rows[0].now });
  } catch (err) {
    console.error('DB health error:', err.message);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    clientIP: req.ip,
    userAgent: req.get('User-Agent')
  });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Server also accessible at http://10.100.102.9:${port}`);
});