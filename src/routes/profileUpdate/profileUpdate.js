// /profile-update
require('dotenv').config();
const router = require('express').Router();
const { authenticateToken } = require('../../middlewares');
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');

// Get a provider's profile updates
router.get('/:providerId', authenticateToken, async (req, res, next) => {
  const { providerId } = req.params;

  const user = req.user;

  if (user.status !== 'admin') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const updateData = await pool.query(
      'SELECT id, reason, status, created_at AS "createdAt" FROM profile_update WHERE provider_id = $1',
      [providerId]
    );

    return res.status(200).json(updateData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Request a profile update to a provider
router.post('/:providerId', authenticateToken, async (req, res, next) => {
  const { providerId } = req.params;
  const user = req.user;

  const { reason } = req.body;

  if (user.status !== 'admin') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const updateData = await pool.query(
      'INSERT INTO profile_update (provider_id, reason, status, created_at) VALUES ($1, $2, $3, current_timestamp) RETURNING id, reason, status, created_at AS "createdAt"',
      [providerId, reason, 'pending']
    );

    return res.status(200).json(updateData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

module.exports = router;