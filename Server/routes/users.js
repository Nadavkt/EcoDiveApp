const express = require('express');
const { getPool } = require('../db');

const router = express.Router();
const pool = getPool();

// NOTE: For simplicity, we accept user id as query param or header.
// In production, use auth middleware and session/JWT to identify the user.

// GET /users/:id - fetch a user profile
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id,
              first_name,
              last_name,
              email,
              id_number,
              profile_image,
              license_front,
              license_back
         FROM users
        WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// PUT /users/:id  → updates only columns that actually exist in your DB
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let {
      first_name,
      last_name,
      email,
      id_number,
      profile_image,   // store the URL/path directly here
      license_front,   // store URL/path or text as you prefer
      license_back
    } = req.body;

    // Backward-compatibility with previous client keys
    profile_image = profile_image || req.body.profile_image_url;
    license_front = license_front || req.body.license_front_url;
    license_back = license_back || req.body.license_back_url;

    const result = await pool.query(
      `UPDATE users SET
         first_name   = COALESCE($1, first_name),
         last_name    = COALESCE($2, last_name),
         email        = COALESCE($3, email),
         id_number    = COALESCE($4, id_number),
         profile_image= COALESCE($5, profile_image),
         license_front= COALESCE($6, license_front),
         license_back = COALESCE($7, license_back)
       WHERE id = $8
       RETURNING id, first_name, last_name, email, id_number,
                 profile_image, license_front, license_back`,
      [
        first_name,
        last_name,
        email,
        id_number,
        profile_image,
        license_front,
        license_back,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// DELETE /users/:id - delete a user account and all associated data
// Requires idNumber in request body for verification
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { idNumber } = req.body;
    
    // Validate that idNumber is provided
    if (!idNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID number is required for account deletion' 
      });
    }
    
    // First, verify that the provided ID number matches the user's account
    const userCheck = await pool.query(
      'SELECT id, id_number, first_name, last_name FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const user = userCheck.rows[0];
    
    // Verify ID number matches
    if (user.id_number !== idNumber) {
      console.log(`Delete attempt failed: ID number mismatch for user ${id}`);
      return res.status(403).json({ 
        success: false, 
        error: 'ID number does not match. Account deletion denied.' 
      });
    }
    
    // Begin transaction to ensure all deletions happen together
    await pool.query('BEGIN');
    
    try {
      // Delete user's dives first (foreign key constraint)
      await pool.query('DELETE FROM dives WHERE user_id = $1', [id]);
      
      // Anonymize user's reviews instead of deleting them (keep valuable content)
      // Note: The reviews table doesn't have user_id, it uses user_name directly
      // We'll match by constructing the user's full name and anonymize those reviews
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      
      let anonymizedReviews = 0;
      if (userName) {
        const reviewsResult = await pool.query(
          `UPDATE reviews 
           SET user_name = 'Anonymous User' 
           WHERE user_name = $1 
           RETURNING review_id`,
          [userName]
        );
        anonymizedReviews = reviewsResult.rows.length;
      }
      
      // Delete the user
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      // Commit transaction
      await pool.query('COMMIT');
      
      console.log(`User ${id} (ID number: ${idNumber}) deleted successfully. ${anonymizedReviews} reviews anonymized.`);
      res.json({ 
        success: true, 
        message: 'Account deleted successfully. Your reviews have been anonymized and preserved.' 
      });
    } catch (err) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

// Base64 upload helper endpoint - saves images/documents under /uploads and returns URLs
router.post('/users/:id/upload', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      profile_image_base64,
      license_base64,
      license_back_base64,
      insurance_base64,
      insurance_doc_base64
    } = req.body || {};

    const path = require('path');
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const saved = {};

    const saveBase64 = (b64, namePrefix, defaultExt = 'png') => {
      if (!b64) return null;
      const matches = b64.match(/^data:(.*?);base64,(.*)$/);
      const buffer = Buffer.from(matches ? matches[2] : b64, 'base64');
      const ext = matches ? (matches[1].split('/')[1] || defaultExt) : defaultExt;
      const filename = `${namePrefix}_${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      return `/uploads/${filename}`;
    };

    if (profile_image_base64) {
      saved.profile_image_url = saveBase64(profile_image_base64, `profile_${id}`, 'png');
    }
    if (license_base64) {
      saved.license_front_url = saveBase64(license_base64, `license_${id}`, 'png');
    }
    if (license_back_base64) {
      saved.license_back_url = saveBase64(license_back_base64, `license_back_${id}`, 'png');
    }
    if (insurance_base64 || insurance_doc_base64) {
      const chosen = insurance_base64 || insurance_doc_base64;
      saved.insurance_url = saveBase64(chosen, `insurance_${id}`, 'png');
    }

    return res.json({ success: true, data: saved });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

module.exports = router;
