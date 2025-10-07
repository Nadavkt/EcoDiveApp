// -------- load env FIRST (exact path) --------
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// -------- app setup --------
const express = require('express');
const cors = require('cors');
// const morgan = require('morgan');

const app = express();

// CORS: allow comma-separated origins via env ALLOWED_ORIGINS; default allow all (dev)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));
// app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Static uploads (e.g., profile images, documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------- routes (require AFTER env is loaded) --------
const registerRoutes   = require('./routes/register');
const diveRoutes       = require('./routes/dives');
const diveSitesRoutes  = require('./routes/dive-sites');
const diveClubsRoutes  = require('./routes/dive-clubs');
const usersRoutes      = require('./routes/users');
const aiRoutes         = require('./routes/ai');

app.use('/', registerRoutes);
app.use('/', diveRoutes);
app.use('/', diveSitesRoutes);
app.use('/', diveClubsRoutes);
app.use('/', usersRoutes);
app.use('/', aiRoutes);

// Health checks
app.get('/health', (_, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
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
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString(), clientIP: req.ip, userAgent: req.get('User-Agent') });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`);
});