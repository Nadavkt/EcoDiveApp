const express = require('express');
const { z } = require('zod');
const { getPool } = require('../db');

const router = express.Router();
const pool = getPool();

// Ensure table exists on first import
const ensureTableSql = `
CREATE TABLE IF NOT EXISTS dive_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  dive_date TIMESTAMP WITH TIME ZONE NOT NULL,
  dive_type VARCHAR(50) NOT NULL,
  location TEXT,
  site TEXT,
  max_depth_m NUMERIC(6,2),
  duration_min INTEGER,
  water_temp_c NUMERIC(5,2),
  visibility_m NUMERIC(6,2),
  weights_kg NUMERIC(6,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dive_history_user_id ON dive_history(user_id);
CREATE INDEX IF NOT EXISTS idx_dive_history_dive_date ON dive_history(dive_date);
`;

pool.query(ensureTableSql).catch((err) => {
  console.error('Failed to ensure dive_history table:', err.message);
});

// Detect which column the DB is using to store the user's identifier
let cachedUserKeyColumn = null; // 'user_id' or 'id_number'
let cachedSiteColumn = null; // 'dive_site' | 'site' | 'location'
let cachedDepthColumn = null; // 'depth' | 'max_depth' | 'max_depth_m'
let cachedHasDiveNumber = null; // boolean
let cachedHasDiveTimestamp = null; // boolean
async function getUserKeyColumn() {
  if (cachedUserKeyColumn) return cachedUserKeyColumn;
  try {
    await pool.query('SELECT user_id FROM dive_history LIMIT 0');
    cachedUserKeyColumn = 'user_id';
  } catch (_) {
    try {
      await pool.query('SELECT id_number FROM dive_history LIMIT 0');
      cachedUserKeyColumn = 'id_number';
    } catch (err) {
      console.error('Unable to determine user key column on dive_history:', err.message);
      // Default to user_id
      cachedUserKeyColumn = 'user_id';
    }
  }
  return cachedUserKeyColumn;
}

async function getSiteColumn() {
  if (cachedSiteColumn) return cachedSiteColumn;
  try {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'dive_history'`
    );
    const cols = result.rows.map(r => r.column_name);
    if (cols.includes('dive_site')) cachedSiteColumn = 'dive_site';
    else if (cols.includes('site')) cachedSiteColumn = 'site';
    else if (cols.includes('location')) cachedSiteColumn = 'location';
    else cachedSiteColumn = 'site';
  } catch (err) {
    console.error('Unable to determine site column for dive_history:', err.message);
    cachedSiteColumn = 'site';
  }
  return cachedSiteColumn;
}

async function getDepthColumn() {
  if (cachedDepthColumn) return cachedDepthColumn;
  try {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'dive_history'`
    );
    const cols = result.rows.map(r => r.column_name);
    if (cols.includes('depth')) cachedDepthColumn = 'depth';
    else if (cols.includes('max_depth')) cachedDepthColumn = 'max_depth';
    else if (cols.includes('max_depth_m')) cachedDepthColumn = 'max_depth_m';
    else cachedDepthColumn = 'depth';
  } catch (err) {
    console.error('Unable to determine depth column for dive_history:', err.message);
    cachedDepthColumn = 'depth';
  }
  return cachedDepthColumn;
}

async function loadSchemaPresence() {
  if (cachedHasDiveNumber !== null && cachedHasDiveTimestamp !== null) return;
  try {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'dive_history'`
    );
    const cols = result.rows.map(r => r.column_name);
    cachedHasDiveNumber = cols.includes('dive_number');
    cachedHasDiveTimestamp = cols.includes('dive_timestamp');
  } catch (err) {
    console.error('Unable to inspect dive_history schema:', err.message);
    cachedHasDiveNumber = false;
    cachedHasDiveTimestamp = false;
  }
}

// Accept client payload and map to existing DB columns
const diveSchema = z.object({
  idNumber: z.string().min(1),
  diveDate: z.string().datetime().or(z.string().min(1)), // stored in dive_date
  diveType: z.enum(['scuba', 'free']).or(z.string().min(1)),
  site: z.string().optional().nullable(), // maps to dive_site
  maxDepthM: z.number().optional().nullable(), // maps to depth
  depth: z.number().optional().nullable(),
  durationMin: z.number().int().optional().nullable(), // maps to duration (minutes)
  weight: z.number().optional().nullable(), // or weightsKg
  weightsKg: z.number().optional().nullable(),
  bodyDiver: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  diveNumber: z.union([z.string(), z.number()]).optional().nullable(),
  diveTimestamp: z.string().optional().nullable(),
  conditions: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  notes: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  waterTempC: z.number().optional().nullable(),
  visibilityM: z.number().optional().nullable()
});

// POST /dives - add a new dive for a user by id_number
router.post('/dives', async (req, res) => {
  try {
    const parsed = diveSchema.parse(req.body);
    console.log('Incoming dive payload:', {
      idNumber: parsed.idNumber,
      diveDate: parsed.diveDate,
      diveType: parsed.diveType,
      site: parsed.site,
      bodyDiver: parsed.bodyDiver,
      description: parsed.description
    });
    const {
      idNumber,
      diveDate,
      diveType,
      location,
      site,
      maxDepthM,
      durationMin,
      waterTempC,
      visibilityM,
      weightsKg,
      notes
    } = parsed;

    const userKeyCol = await getUserKeyColumn();
    const siteCol = await getSiteColumn();
    const depthCol = await getDepthColumn();
    await loadSchemaPresence();

    // Map incoming fields to your schema
    const depthValue = (typeof parsed.depth === 'number' ? parsed.depth : (typeof parsed.maxDepthM === 'number' ? parsed.maxDepthM : null));
    const weightValue = (typeof parsed.weight === 'number' ? parsed.weight : (typeof parsed.weightsKg === 'number' ? parsed.weightsKg : null));

    // Build dynamic insert to match columns you showed
    const columns = [userKeyCol, 'dive_date', 'dive_type', siteCol, depthCol, 'duration', 'weight', 'body_diver', 'description'];
    const values = [idNumber, diveDate, diveType, (site || location) || null, depthValue, durationMin ?? null, weightValue, parsed.bodyDiver || null, parsed.description || parsed.notes || null];

    // Dive number: if column exists and not provided, auto-increment per user
    if (cachedHasDiveNumber) {
      let diveNumberValue = parsed.diveNumber || null;
      if (!diveNumberValue) {
        const q = await pool.query(`SELECT COALESCE(MAX(dive_number), 0) + 1 AS next FROM dive_history WHERE ${userKeyCol} = $1`, [idNumber]);
        diveNumberValue = q.rows[0]?.next || 1;
      }
      columns.push('dive_number');
      values.push(diveNumberValue);
    }

    // Dive timestamp: default NOW() if column exists and not provided
    if (cachedHasDiveTimestamp) {
      columns.push('dive_timestamp');
      values.push(parsed.diveTimestamp || new Date().toISOString());
    }
    if (parsed.conditions) { columns.push('conditions'); values.push(parsed.conditions); }

    const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
    const insertSql = `INSERT INTO dive_history (${columns.join(',')}) VALUES (${placeholders}) RETURNING *`;
    const insertParams = values;
    const insertRes = await pool.query(insertSql, insertParams);
    const inserted = insertRes.rows[0];
    console.log('Dive created:', { id: inserted?.id, userKeyCol, siteCol, depthCol, userIdValue: idNumber, date: inserted?.dive_date, body_diver: inserted?.body_diver, description: inserted?.description });

    res.status(201).json(inserted);
  } catch (err) {
    console.error('Create dive error:', err);
    res.status(400).json({ message: err.message || 'Failed to create dive' });
  }
});

// GET /dives?idNumber=... - list dives for a user ordered by date desc
router.get('/dives', async (req, res) => {
  try {
    const idNumber = String(req.query.idNumber || '').trim();
    if (!idNumber) {
      return res.status(400).json({ message: 'idNumber is required' });
    }
    const userKeyCol = await getUserKeyColumn();
    const result = await pool.query(
      `SELECT * FROM dive_history WHERE ${userKeyCol} = $1 ORDER BY dive_date DESC, id DESC`,
      [idNumber]
    );
    console.log('List dives:', { userKeyCol, idNumber, count: result.rows.length });
    res.json(result.rows);
  } catch (err) {
    console.error('List dives error:', err);
    res.status(400).json({ message: err.message || 'Failed to list dives' });
  }
});

module.exports = router;


