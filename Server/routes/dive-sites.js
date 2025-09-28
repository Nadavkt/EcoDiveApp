const express = require('express');
const { z } = require('zod');
const { getPool } = require('../db');

const router = express.Router();
const pool = getPool();

// Ensure dive_sites table exists
const ensureDiveSitesTable = `
CREATE TABLE IF NOT EXISTS dive_sites (
    site_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dive_sites_location ON dive_sites(location);
CREATE INDEX IF NOT EXISTS idx_dive_sites_coordinates ON dive_sites(latitude, longitude);
`;

// Ensure reviews table exists
const ensureReviewsTable = `
CREATE TABLE IF NOT EXISTS reviews (
    review_id SERIAL PRIMARY KEY,
    club_id INTEGER,
    site_id INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (site_id) REFERENCES dive_sites(site_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_site_id ON reviews(site_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
`;

// Initialize tables
pool.query(ensureDiveSitesTable).catch((err) => {
  console.error('Failed to ensure dive_sites table:', err.message);
});

pool.query(ensureReviewsTable).catch((err) => {
  console.error('Failed to ensure reviews table:', err.message);
});

// Validation schemas
const reviewSchema = z.object({
  site_id: z.number().int().positive(),
  user_name: z.string().min(1).max(255),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
  club_id: z.number().int().positive().optional().nullable()
});

// GET /dive-sites - Get all dive sites
router.get('/dive-sites', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dive_sites ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get dive sites error:', err);
    res.status(500).json({ message: 'Failed to fetch dive sites' });
  }
});

// GET /dive-sites/:id - Get specific dive site with reviews
router.get('/dive-sites/:id', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    if (isNaN(siteId)) {
      return res.status(400).json({ message: 'Invalid site ID' });
    }

    // Get dive site details
    const siteResult = await pool.query(
      'SELECT * FROM dive_sites WHERE site_id = $1',
      [siteId]
    );

    if (siteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Dive site not found' });
    }

    // Get reviews for this site
    const reviewsResult = await pool.query(
      'SELECT * FROM reviews WHERE site_id = $1 ORDER BY created_at DESC',
      [siteId]
    );

    // Calculate average rating
    const avgRatingResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE site_id = $1',
      [siteId]
    );

    const site = siteResult.rows[0];
    const reviews = reviewsResult.rows;
    const avgRating = avgRatingResult.rows[0];

    res.json({
      ...site,
      reviews,
      average_rating: parseFloat(avgRating.avg_rating) || 0,
      review_count: parseInt(avgRating.review_count) || 0
    });
  } catch (err) {
    console.error('Get dive site error:', err);
    res.status(500).json({ message: 'Failed to fetch dive site' });
  }
});

// POST /dive-sites/:id/reviews - Add a review for a dive site
router.post('/dive-sites/:id/reviews', async (req, res) => {
  try {
    const siteId = parseInt(req.params.id);
    if (isNaN(siteId)) {
      return res.status(400).json({ message: 'Invalid site ID' });
    }

    // Verify site exists
    const siteCheck = await pool.query(
      'SELECT site_id FROM dive_sites WHERE site_id = $1',
      [siteId]
    );

    if (siteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Dive site not found' });
    }

    const parsed = reviewSchema.parse({
      ...req.body,
      site_id: siteId
    });

    const result = await pool.query(
      'INSERT INTO reviews (site_id, user_name, rating, comment, club_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [parsed.site_id, parsed.user_name, parsed.rating, parsed.comment || null, parsed.club_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create review error:', err);
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid review data', errors: err.errors });
    }
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// GET /dive-sites/map - Get dive sites for map view (with coordinates)
router.get('/dive-sites/map', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT site_id, name, location, latitude, longitude, description FROM dive_sites ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get dive sites map error:', err);
    res.status(500).json({ message: 'Failed to fetch dive sites for map' });
  }
});

module.exports = router;
