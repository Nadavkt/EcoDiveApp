const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { getPool } = require('../db');
const { z } = require('zod');

const router = express.Router();

// Database connection (singleton)
const pool = getPool();

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

// Validation schema
const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  idNumber: z.string().min(3),
  passwordHash: z.string().min(10).max(200),
  profileImage: z.string().nullable().optional(),
  licenseFront: z.string().nullable().optional(),
  licenseBack: z.string().nullable().optional()
});

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /users - Create new user
router.post('/users', async (req, res) => {
  try {
    console.log('Received user data:', req.body);
    const parsed = userSchema.parse(req.body);
    const { firstName, lastName, email, idNumber, passwordHash, profileImage, licenseFront, licenseBack } = parsed;
    
    console.log('Parsed user data:', { firstName, lastName, email, idNumber, passwordHashLength: passwordHash?.length });
    
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, id_number, password, profile_image, license_front, license_back)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, first_name, last_name, email, id_number, profile_image, license_front, license_back, created_at`,
      [firstName, lastName, email, idNumber, passwordHash, profileImage, licenseFront, licenseBack]
    );
    
    console.log('User created successfully:', result.rows[0].id);
    
    // Send response immediately, don't wait for email
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('User creation error:', err);
    // Fast fail for timeouts so client doesn't hang
    if (String(err.message || '').toLowerCase().includes('timeout')) {
      return res.status(504).json({ message: 'Database timeout. Please try again.' });
    }
    if (err.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(400).json({ message: err.message || 'Failed to create user' });
    }
  }
});

// POST /emails/registration - Send registration email with attachments
router.post('/emails/registration', upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'licenseFront', maxCount: 1 },
  { name: 'licenseBack', maxCount: 1 },
  { name: 'insuranceConfirmation', maxCount: 1 }
]), async (req, res) => {
  try {
    const fields = req.body || {};
    const to = fields.toEmail || process.env.DEFAULT_TO_EMAIL;
    
    if (!to) {
      return res.status(400).json({ message: 'Missing toEmail' });
    }

    // Configure email transporter
    console.log('Email config:', {
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS?.length,
      passPreview: process.env.SMTP_PASS?.substring(0, 4) + '...'
    });
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS 
      }
    });

    // Prepare attachments
    const attachments = [];
    ['profileImage', 'licenseFront', 'licenseBack', 'insuranceConfirmation'].forEach((key) => {
      const fileArr = req.files?.[key];
      if (fileArr && fileArr[0]) {
        const f = fileArr[0];
        attachments.push({ 
          filename: f.originalname || `${key}.bin`, 
          content: f.buffer, 
          contentType: f.mimetype 
        });
      }
    });

    // Email HTML template
    const html = `
      <h2>New EcoDive Registration</h2>
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h3>User Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${fields.firstName || ''} ${fields.lastName || ''}</li>
          <li><strong>Email:</strong> ${fields.email || ''}</li>
          <li><strong>ID Number:</strong> ${fields.idNumber || ''}</li>
          <li><strong>Insurance Confirmation:</strong> ${fields.insuranceConfirmationIncluded === 'true' ? 'Included' : 'Not provided'}</li>
        </ul>
        
        <h3>Attached Files:</h3>
        <ul>
          ${attachments.map(att => `<li>${att.filename}</li>`).join('')}
        </ul>
        
        <p><em>Registration submitted on ${new Date().toLocaleString()}</em></p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@ecodive.local',
      to,
      subject: 'EcoDive - New User Registration',
      html,
      attachments
    });

    res.json({ sent: true, attachmentsCount: attachments.length });
  } catch (err) {
    console.error('Email sending error:', err);
    res.status(400).json({ message: err.message || 'Failed to send email' });
  }
});

// POST /login - Authenticate user
const loginSchema = z.object({
  idNumber: z.string().min(1),
  password: z.string().min(1)
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { idNumber: req.body.idNumber });
    const parsed = loginSchema.parse(req.body);
    const { idNumber, password } = parsed;
    
    // Find user by ID number
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, id_number, password, profile_image, license_front, license_back, created_at FROM users WHERE id_number = $1',
      [idNumber]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login successful for user:', user.id);
    res.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Login successful'
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ message: err.message || 'Login failed' });
  }
});

module.exports = router;
