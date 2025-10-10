const express = require('express');
const nodemailer = require('nodemailer');
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
      'SELECT id, id_number, first_name, last_name, email FROM users WHERE id = $1',
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
      // Delete user's dive history
      try {
        await pool.query('DELETE FROM dive_history WHERE user_id = $1', [id]);
      } catch (diveErr) {
        // Table might not exist, that's okay - just log and continue
        console.log('Dive history table not found or error deleting dives:', diveErr.message);
      }
      
      // Anonymize user's reviews instead of deleting them (keep valuable content)
      // Note: The reviews table doesn't have user_id, it uses user_name directly
      // We'll match by constructing the user's full name and anonymize those reviews
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      
      let anonymizedReviews = 0;
      if (userName) {
        try {
          const reviewsResult = await pool.query(
            `UPDATE reviews 
             SET user_name = 'Anonymous User' 
             WHERE user_name = $1 
             RETURNING review_id`,
            [userName]
          );
          anonymizedReviews = reviewsResult.rows.length;
        } catch (reviewErr) {
          // Reviews table might not exist or error updating - log and continue
          console.log('Error anonymizing reviews:', reviewErr.message);
        }
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
      
      // Send confirmation email to the user
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { 
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS 
          }
        });

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4cc5ff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background-color: #fff; border-left: 4px solid #4cc5ff; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>EcoDive Account Deletion</h1>
              </div>
              <div class="content">
                <h2>Your Account Has Been Deleted</h2>
                <p>Hello ${user.first_name} ${user.last_name},</p>
                <p>We're writing to confirm that your EcoDive account has been permanently deleted as requested.</p>
                
                <div class="info-box">
                  <strong>What has been deleted:</strong>
                  <ul>
                    <li>Your profile and personal information</li>
                    <li>Your dive history and logs</li>
                    <li>Your account credentials</li>
                  </ul>
                </div>
                
                ${anonymizedReviews > 0 ? `
                <div class="info-box">
                  <strong>Reviews Preserved:</strong>
                  <p>${anonymizedReviews} review(s) you wrote have been anonymized and preserved to help the diving community. They now appear as "Anonymous User".</p>
                </div>
                ` : ''}
                
                <p>If you did not request this deletion, please contact us immediately at <strong>${process.env.SMTP_USER}</strong>.</p>
                
                <p>We're sorry to see you go! If you'd like to return to EcoDive in the future, you're always welcome to create a new account.</p>
                
                <p>Thank you for being part of our diving community!</p>
                
                <p><strong>The EcoDive Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} EcoDive. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"EcoDive" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'EcoDive Account Deletion Confirmation',
          html: emailHtml
        });

        console.log(`Account deletion confirmation email sent to ${user.email}`);
      } catch (emailError) {
        // Don't fail the deletion if email fails, just log it
        console.error('Failed to send deletion confirmation email:', emailError.message);
      }
      
      res.json({ 
        success: true, 
        message: 'Account deleted successfully.' + (anonymizedReviews > 0 ? ' Your reviews have been anonymized and preserved.' : '')
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
