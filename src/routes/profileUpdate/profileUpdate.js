// /profileUpdate
require('dotenv').config();
const router = require('express').Router();
const { authenticateToken } = require('../../middlewares');
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');

// Mark a request as completed
router.put('/:updateId/changeStatus', authenticateToken, async (req, res, next) => {
  const { updateId } = req.params;
  const user = req.user;

  const { status } = req.body;

  if (status !== 'completed' && status !== 'pending') {
    return normalMsg(res, 400, false, "Incorrect status");
  }

  try {
    await pool.query(
      'UPDATE profile_update SET status = $1 WHERE provider_id = $2 AND id = $3',
      [status, user.id, updateId]
    );

    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Get a provider's profile updates
router.get('/:providerId', authenticateToken, async (req, res, next) => {
  const { providerId } = req.params;

  const user = req.user;

  if (user.status !== 'admin' && parseInt(user.id) !== parseInt(providerId)) {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const updateData = await pool.query(
      'SELECT id, reason, status, created_at AS "createdAt" FROM profile_update WHERE provider_id = $1 ORDER BY created_at DESC',
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