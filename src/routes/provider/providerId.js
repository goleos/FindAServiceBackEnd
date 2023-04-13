// /provider/:providerId
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');
const { authenticateToken } = require('../../middlewares');

// Get a provider
router.get('/', authenticateToken, async (req, res, next) => {
  const { providerId } = req.params;

  const user = req.user;

  try {
    const providerData = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName", email, description, address, profile_image AS "profileImage", is_approved AS "isApproved", is_available AS "isAvailable" FROM provider WHERE id = $1',
      [providerId]
    );

    if (providerData.rows[0].isAvailable) {
      return res.status(200).json(providerData.rows[0]);
    } else {
      return res.status(200).json(null);
    }

    
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Get a provider
router.put('/', authenticateToken, async (req, res, next) => {

  const user = req.user;

  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    description,
    address,
    profileImage
  } = req.body;

  // Check passwords match
  if (password !== confirmPassword) {
    return normalMsg(res, 400, false, "Passwords don't match");
  }

  // Check email exists Postgresql
  try {
    const data = await pool.query(
      'SELECT id FROM provider WHERE provider.email = $1 AND id != $1',
      [email, user.id]);

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
        'UPDATE provider SET email = $1, password = $2, first_name = $3, last_name = $4, profile_image = $5, description = $6, address = $7)',
        [email, hash, firstName, lastName, profileImage, description, address]);

      return normalMsg(res, 201, true, "OK");
    } catch (err) {
      res.status(500);
      next(err)
    }
  });

  
})

// Approve a provider
router.put('/approve', authenticateToken, async (req, res, next) => {
  const { providerId } = req.params;

  const user = req.user;

  if (user.status !== 'admin') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    await pool.query(
      'UPDATE provider SET is_approved = true WHERE id = $1',
      [providerId]
    );

    return normalMsg(res, 200, true, "OK")
  } catch (err) {
    res.status(500);
    next(err)
  }
})

// Reject a provider
router.put('/reject', authenticateToken, async (req, res, next) => {
  const { providerId } = req.params;

  const user = req.user;

  if (user.status !== 'admin') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    await pool.query(
      'UPDATE provider SET is_available = false WHERE id = $1',
      [providerId]
    );

    return normalMsg(res, 200, true, "OK")
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;