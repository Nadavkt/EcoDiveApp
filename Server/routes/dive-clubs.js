const express = require('express');
const { getPool } = require('../db');
const router = express.Router();

// Database connection
const pool = getPool();

// GET /dive-clubs - Get all dive clubs
router.get('/dive-clubs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(club_id, id) as club_id,
        name,
        COALESCE(location, city) as location,
        description,
        COALESCE(contact_email, '') as contact_email,
        COALESCE(contact_phone, phone) as contact_phone,
        website,
        COALESCE(image_url, '') as image_url,
        COALESCE(created_at, NOW()) as created_at,
        rating
      FROM dive_clubs 
      ORDER BY name ASC
    `);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching dive clubs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dive clubs',
      details: error.message
    });
  }
});

// GET /dive-clubs/:id - Get specific dive club
router.get('/dive-clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        COALESCE(club_id, id) as club_id,
        name,
        COALESCE(location, city) as location,
        description,
        COALESCE(contact_email, '') as contact_email,
        COALESCE(contact_phone, phone) as contact_phone,
        website,
        COALESCE(image_url, '') as image_url,
        COALESCE(created_at, NOW()) as created_at,
        rating
      FROM dive_clubs 
      WHERE COALESCE(club_id, id) = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dive club not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching dive club:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dive club',
      details: error.message
    });
  }
});

// POST /dive-clubs/:id/reviews - Submit a review for a dive club
router.post('/dive-clubs/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, rating, comment } = req.body;
    
    // Validate required fields
    if (!user_name || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_name, rating, and comment are required'
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if club exists
    const clubCheck = await pool.query(
      'SELECT club_id FROM dive_clubs WHERE COALESCE(club_id, id) = $1',
      [id]
    );
    
    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dive club not found'
      });
    }
    
    // Insert review
    const result = await pool.query(`
      INSERT INTO reviews (club_id, user_name, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING review_id, created_at
    `, [id, user_name, rating, comment]);
    
    res.json({
      success: true,
      data: {
        review_id: result.rows[0].review_id,
        club_id: id,
        user_name,
        rating,
        comment,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error submitting club review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review',
      details: error.message
    });
  }
});

// GET /dive-clubs/:id/reviews - Get reviews for a specific dive club
router.get('/dive-clubs/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        review_id,
        user_name,
        rating,
        comment,
        created_at
      FROM reviews 
      WHERE club_id = $1
      ORDER BY created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching club reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
      details: error.message
    });
  }
});

module.exports = router;
