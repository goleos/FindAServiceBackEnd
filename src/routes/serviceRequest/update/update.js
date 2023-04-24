// /serviceRequest/update
require('dotenv').config();
const router = require('express').Router();
const { authenticateToken } = require('../../../middlewares');
const { pool } = require('../../../config/postgresConfig');
const { normalMsg } = require('../../../helpers/returnMsg');

// Mark a update request as completed
router.put('/:updateId/changeStatus', authenticateToken, async (req, res, next) => {
  const { updateId } = req.params;
  const user = req.user;

  const { status } = req.body;

  if (user.status !== 'customer') {
    return normalMsg(res, 400, false, "Unauthorised");
  }

  if (status !== 'completed' && status !== 'pending') {
    return normalMsg(res, 400, false, "Incorrect status");
  }

  try {
    const requestUpdate = await pool.query(
      'UPDATE service_request_update SET status = $1 WHERE id = $2 RETURNING service_request_id',
      [status, updateId]
    );

    if (requestUpdate.rows.length < 0) {
      return normalMsg(res, 400, false, "Update not done");
    }

    await pool.query(
      'UPDATE service_request SET status = $1 WHERE id = $2',
      ['pending', requestUpdate.rows[0].service_request_id]
    );
    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Get a service request's updates
router.get('/:serviceRequestId', authenticateToken, async (req, res, next) => {
  const { serviceRequestId } = req.params;

  const user = req.user;

  try {
    const updateData = await pool.query(
      'SELECT id, reason, status, created_at AS "createdAt" FROM service_request_update WHERE service_request_id = $1 ORDER BY created_at DESC',
      [serviceRequestId]
    );

    return res.status(200).json(updateData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Request that the customer makes an update to the service request
router.post('/:serviceRequestId', authenticateToken, async (req, res, next) => {
  const { serviceRequestId } = req.params;
  const user = req.user;

  const { reason } = req.body;

  if (user.status !== 'provider') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const updateData = await pool.query(
      'INSERT INTO service_request_update (service_request_id, reason, status, created_at) VALUES ($1, $2, $3, current_timestamp) RETURNING id, reason, status, created_at AS "createdAt"',
      [serviceRequestId, reason, 'pending']
    );

    return res.status(200).json(updateData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});


module.exports = router;