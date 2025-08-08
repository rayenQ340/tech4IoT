require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const { body, validationResult } = require('express-validator');
const sequelize = require('./config/dbConfig');
const _User = require('./models/user');

const app = express();

// ======================
// Middleware
// ======================
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Enhanced JSON handling
app.use(express.json({ 
  limit: '10kb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// Routes
// ======================

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Registration Endpoint
app.post('/api/v1/auth/register', 
  [
    body('FullName').trim().notEmpty().isLength({ min: 2, max: 100 }),
    body('Password').isLength({ min: 6 }),
    body('Email').isEmail().normalizeEmail(),
    body('Region').notEmpty(),
    body('PhoneNumber').isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await _User.create({
        FullName: req.body.FullName,
        Password: req.body.Password, // Will be hashed by model
        Email: req.body.Email,
        Region: req.body.Region,
        PhoneNumber: req.body.PhoneNumber
      });

      res.status(201).json({
        id: user.user_id,
        FullName: user.FullName,
        Email: user.Email
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

// ======================
// Server Startup
// ======================
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
  });