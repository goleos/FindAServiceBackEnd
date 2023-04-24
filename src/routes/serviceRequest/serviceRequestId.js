// /serviceRequest/:serviceRequestId
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { authenticateToken } = require('../../middlewares');
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');

// Get a particular service request
router.get('/', authenticateToken, async (req, res, next) => {

  const { serviceRequestId } = req.params;

  const user = req.user;

  if (user.status === 'admin') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    let sqlQuery = `SELECT service_request.id, service_request.description, service_request.status, service_request.customer_address AS "customerAddress", service_request.booking_time AS "bookingTime", service_request.created_at AS "createdAt", service_request.provider_id AS "providerId", service.title, service.price, service.category`

    if (user.status === 'customer') {

      sqlQuery += `, provider.first_name AS "firstName", provider.last_name AS "lastName", provider.profile_image AS "profileImage" FROM service_request INNER JOIN service ON service_request.service_id = service.id INNER JOIN provider ON service_request.provider_id = provider.id WHERE service_request.customer_id = ${user.id}`

    } else {
      sqlQuery += `, customer.first_name AS "firstName", customer.last_name AS "lastName", customer.profile_image AS "profileImage" FROM service_request INNER JOIN service ON service_request.service_id = service.id INNER JOIN customer ON service_request.customer_id = customer.id WHERE service_request.provider_id = ${user.id}`
    }

    sqlQuery += ` AND service_request.id = ${serviceRequestId}`

    console.log(sqlQuery);

    const data = await pool.query(sqlQuery);

    return res.status(200).json(data.rows[0]);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Edit a service request
router.put('/', authenticateToken, async (req, res, next) => {
  const { serviceRequestId } = req.params;
  const user = req.user;

  const { description, bookingTime, customerAddress } = req.body;

  if (user.status !== 'customer') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const updateData = await pool.query(
      'UPDATE service_request SET description = $1, booking_time = $2, customer_address = $3 WHERE id = $4',
      [description, bookingTime, customerAddress, serviceRequestId]);

    return res.status(200).json(updateData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Change the status of a service request
router.put('/status', authenticateToken, async (req, res, next) => {

  const { serviceRequestId } = req.params;
  const { status } = req.body;

  const user = req.user;

  if (user.status !== 'provider') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    await pool.query(
      'UPDATE service_request SET status = $1 WHERE id = $2',
      [status, serviceRequestId]
    );

    return normalMsg(res, 200, true, "OK")
  } catch (err) {
    res.status(500);
    next(err)
  }
});

module.exports = router;