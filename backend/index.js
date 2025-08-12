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

// Set Express to trust the first proxy hop (e.g., ngrok)
// This must be done BEFORE the rate limiter is applied.
app.set('trust proxy', 1);

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
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/front', express.static(path.join(__dirname, '../front')));
app.get('/', (req, res) => {
  res.redirect('/front/index.html');
});// ======================
// Routes
// ======================

// Import auth routes
const authRoutes = require('./routes/auth_route');

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Mount auth routes with versioning
app.use('/api/v1/auth', authRoutes);

// ======================
// Server Startup
// ======================
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    // Log all available routes
    console.log('Available routes:');
    app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
      } else if (r.name === 'router') {
        // Handle mounted routers
        r.handle.stack.forEach((handler) => {
          if (handler.route && handler.route.path) {
            console.log(`${Object.keys(handler.route.methods)[0].toUpperCase()} /api/v1/auth${handler.route.path}`);
          }
        });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err);
  });
