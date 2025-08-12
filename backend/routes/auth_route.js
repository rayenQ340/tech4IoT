require('dotenv').config();
const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const _User = require("../models/user");
const sequelize = require("../config/dbConfig");

// Validation rules
const loginValidator = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required')
];

const registerValidator = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required'),
  body('position').isIn(['prof', 'etudiant']).withMessage('Position must be either prof or etudiant')
];

// JWT configuration
const JWT_CONFIG = {
  expiresIn: process.env.JWT_EXPIRES || '24h',
  issuer: process.env.JWT_ISSUER || 'your-app-name'
};

// Login endpoint with debugging
router.post("/login", loginValidator, async (req, res, next) => {
  try {
    // Debugging logs
    console.log('\n=== INCOMING REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Raw body:', req.body);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('\n=== VALIDATION ERRORS ===');
      console.log(errors.array());
      
      return res.status(400).json({ 
        status: 'error',
        message: "Validation failed",
        errors: errors.array(),
        alertType: 'validation_error'
      });
    }

    // Debugging before database query
    console.log('\n=== BEFORE USER QUERY ===');
    console.log('Searching for email:', req.body.email);

    // Find user by email
    const user = await _User.findOne({ 
      where: { email: req.body.email },
      attributes: ['user_id', 'fullName', 'email', 'password', 'position']
    });

    if (!user) {
      console.log('\n=== USER NOT FOUND ===');
      return res.status(401).json({ 
        status: 'error',
        message: "Invalid credentials",
        code: "AUTH_FAILED",
        alertType: 'invalid_credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      console.log('\n=== PASSWORD MISMATCH ===');
      return res.status(401).json({ 
        status: 'error',
        message: "Invalid credentials",
        code: "AUTH_FAILED",
        alertType: 'invalid_credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        position: user.position
      },
      process.env.JWT_SECRET,
      JWT_CONFIG
    );

    // Omit password from response
    const userResponse = {
      id: user.user_id,
      fullName: user.fullName,
      email: user.email,
      position: user.position
    };

    console.log('\n=== LOGIN SUCCESS ===');
    console.log('User logged in:', userResponse.email);

    res.json({
      status: 'success',
      message: "Login successful",
      token,
      user: userResponse,
      alertType: 'login_success'
    });

  } catch (err) {
    console.error('\n=== LOGIN ERROR ===');
    console.error(err);
    next(err);
  }
});

// Registration endpoint with debugging
router.post("/register", registerValidator, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Debugging logs
    console.log('\n=== REGISTRATION REQUEST ===');
    console.log('Request body:', req.body);
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('\n=== REGISTRATION VALIDATION ERRORS ===');
      console.log(errors.array());
      
      await transaction.rollback();
      return res.status(400).json({ 
        status: 'error',
        message: "Validation failed",
        errors: errors.array(),
        alertType: 'validation_error'
      });
    }

    // Normalize email
    const normalizedEmail = req.body.email.toLowerCase().trim();

    // Check for existing user
    console.log('\n=== CHECKING FOR EXISTING USER ===');
    console.log('Email:', normalizedEmail);
    
    const existingUser = await _User.findOne({ 
      where: { email: normalizedEmail },
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    
    if (existingUser) {
      console.log('\n=== EMAIL ALREADY EXISTS ===');
      await transaction.rollback();
      return res.status(409).json({ 
        status: 'error',
        message: "Email already registered",
        code: "DUPLICATE_EMAIL",
        alertType: 'duplicate_email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // Create new user
    console.log('\n=== CREATING NEW USER ===');
    const user = await _User.create({
      fullName: req.body.fullName,
      password: hashedPassword,
      email: normalizedEmail,
      region: req.body.region,
      phoneNumber: req.body.phoneNumber,
      position: req.body.position
    }, { transaction });

    await transaction.commit();

    // Omit password from response
    const userResponse = {
      id: user.user_id,
      fullName: user.fullName,
      email: user.email,
      position: user.position
    };

    console.log('\n=== REGISTRATION SUCCESS ===');
    console.log('New user created:', userResponse.email);

    return res.status(201).json({
      status: 'success',
      message: "Registration successful",
      data: { user: userResponse },
      alertType: 'registration_success'
    });

  } catch (err) {
    console.error('\n=== REGISTRATION ERROR ===');
    console.error(err);
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;