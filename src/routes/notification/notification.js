// /notification
require('dotenv').config();
const router = require('express').Router();
const { authenticateToken } = require('../../middlewares');
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');

// Get notifications
router.get('/', authenticateToken, async (req, res, next) => {

  const user = req.user;

  if (user.status !== 'customer') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const data = await pool.query(
      'SELECT notification.id, notification.provider_id AS "providerId", notification.customer_id AS "customerId", notification.service_id AS "serviceId", notification.date, notification.type, notification.read, provider.first_name AS "providerFirstName", provider.last_name AS "providerLastName", provider.profile_image AS "providerProfileImage" FROM notification INNER JOIN provider ON notification.provider_id = provider.id WHERE customer_id = $1 ORDER BY notification.date DESC',
      [user.id]);

    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Make all read notifications unread
router.post('/read', authenticateToken, async (req, res, next) => {

  const user = req.user;

  if (user.status !== 'customer') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const data = await pool.query(
      'UPDATE notification SET read = true WHERE customer_id = $1',
      [user.id]);

    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Get number of unread notifications
router.get('/unreadCount', authenticateToken, async (req, res, next) => {

  const user = req.user;

  if (user.status !== 'customer') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const data = await pool.query(
      'SELECT COUNT(id) FROM notification WHERE customer_id = $1 AND read = false',
      [user.id]);

    return res.status(200).json(data.rows[0].count);
  } catch (err) {
    res.status(500);
    next(err)
  }
});


module.exports = router;