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