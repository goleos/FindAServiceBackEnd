// /customer
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { pool } = require('../../config/postgresConfig');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../middlewares');
const { PROFILE_IMAGE } = require('../../helpers/contants');
const { normalMsg, loginMsg } = require('../../helpers/returnMsg');

// Register a new provider
router.post('/register', async (req, res, next) => {
  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName
  } = req.body;

  // Check passwords match
  if (password !== confirmPassword) {
    return normalMsg(res, 400, false, "Passwords don't match");
  }

  // Check email exists Postgresql
  try {
    const data = await pool.query(
      'SELECT id FROM customer WHERE customer.email = $1',
      [email]);

    if (data.rows.length !== 0) {
      return normalMsg(res, 400, false, "Email already exists");
    }

  } catch (err) {
    res.status(500);
    next(err);
  }

  // Hash password
  await bcrypt.hash(password, 5, async (err, hash) => {
    if (err) {
      res.status(500);
      next(err)
    }

    // Add user to PostgreSQL
    try {
      await pool.query(
        'INSERT INTO customer (email, password, first_name, last_name, profile_image) VALUES ($1, $2, $3, $4, $5)',
        [email, hash, firstName, lastName, PROFILE_IMAGE]);

      return normalMsg(res, 201, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  });
});

// Login a user
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return loginMsg(res, 400, false, "Bad Request", false);
  }

  // Get hash from db
  let id = "";
  let hash = "";

  try {
    const data = await pool.query(
      'SELECT id, email, password FROM customer WHERE email = $1',
      [email]);

    if (data.rows.length === 0) {
      return loginMsg(res, 400, false, "Invalid credentials", false);
    }

    hash = data.rows[0].password;
    id = data.rows[0].id;
  } catch (err) {
    res.status(500);
    next(err);
  }

  // Check password
  bcrypt.compare(password, hash, function (err, result) {
    if (result) {
      const token = jwt.sign(
        { id: id, status: "customer" },
        process.env.TOKEN_SECRET
      );
      return loginMsg(res, 200, true, "OK", token);
    } else {
      return loginMsg(res, 401, false, "Invalid credentials", false);
    }
  });
});

// Get information about the current authenticated provider
router.get('/currentCustomer', authenticateToken, async (req, res, next) => {
  const user = req.user;

  if (user.status != 'customer') {
    return res.status(401).json({ status: false, message: "Unauthorised" });
  }

  try {
    const data = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, profile_image AS "profileImage" FROM customer WHERE customer.id = $1',
      [user.id]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

module.exports = router;