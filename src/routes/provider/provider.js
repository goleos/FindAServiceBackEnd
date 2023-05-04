// /provider
require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { pool } = require('../../config/postgresConfig');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../middlewares');
const { PROFILE_IMAGE } = require('../../helpers/contants');
const { normalMsg, loginMsg } = require('../../helpers/returnMsg');

const providerIdRoute = require('./providerId');
const providerEditProfileRoute = require('./editProfile');

// Register a new provider
router.post('/register', async (req, res, next) => {
  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    description,
    address
  } = req.body;

  console.log("hi");


  // Check passwords match
  if (password !== confirmPassword) {
    return normalMsg(res, 400, false, "Passwords don't match");
  }

  // Check email exists Postgresql
  try {
    const data = await pool.query(
      'SELECT id FROM provider WHERE provider.email = $1',
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
        'INSERT INTO provider (email, password, first_name, last_name, profile_image, description, address) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [email, hash, firstName, lastName, PROFILE_IMAGE, description, address]);

      return normalMsg(res, 201, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  });
});

// Login a provider
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
      'SELECT id, email, password FROM provider WHERE email = $1',
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
        { id: id, status: "provider" },
        process.env.TOKEN_SECRET
      );
      return loginMsg(res, 200, true, "OK", token);
    } else {
      return loginMsg(res, 401, false, "Invalid credentials", false);
    }
  });
});

// Get information about the current authenticated provider
router.get('/currentProvider', authenticateToken, async (req, res, next) => {
  const user = req.user;

  if (user.status != 'provider') {
    return res.status(401).json({ status: false, message: "Unauthorised" });
  }

  try {
    const data = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, profile_image AS "profileImage", description, address, is_approved AS "isApproved", is_available as "isAvailable" FROM provider WHERE provider.id = $1',
      [user.id]
    );
    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// Get unapproved providers
router.get('/unapproved', authenticateToken, async (req, res, next) => {
  const user = req.user;

  if (user.status !== 'admin') {
    return normalMsg(res, 400, false, "Unauthorised to make this request");
  }

  try {
    const providerData = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, description, address, profile_image AS "profileImage" FROM provider WHERE is_approved = false AND is_available = true;',
    );

    // Get status (toReview or pending)
    // toReview => no pending profile updates
    // pending => 1 pending profile update
    let data = []

    for (const row of providerData.rows) {
      const provider = row;
      provider.status = "pending";

      const updateData = await pool.query(
        "SELECT id FROM profile_update WHERE provider_id = $1 AND status = $2",
        [provider.id, 'pending']
      );

      // No pending updates
      if (updateData.rows.length === 0) {
        provider.status = "toReview";
      }

      data.push(provider);
    }

    return res.status(200).json(data);
  } catch (err) {
    res.status(500);
    next(err)
  }

});


// Routes for editing provider's profile
router.use('/editProfile', providerEditProfileRoute)

// Routes for a specific provider id
router.use('/:providerId', providerIdRoute)

module.exports = router;