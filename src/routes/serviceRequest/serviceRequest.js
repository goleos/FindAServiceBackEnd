// /serviceRequest
require('dotenv').config();
const router = require('express').Router();
const { authenticateToken } = require('../../middlewares');
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');

const serviceRequestIdRoute = require('./serviceRequestId');
const updateRoute = require('./update/update');

// Make a service request
router.post('/:serviceId', authenticateToken, async (req, res, next) => {
  const { serviceId } = req.params;
  const user = req.user;

  const { description, bookingTime, customerAddress } = req.body;

  if (user.status !== 'customer') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    const providerIdData = await pool.query(
      'SELECT provider_id AS "providerId" FROM service WHERE id = $1', 
      [Number(serviceId)]
    );

    if (providerIdData.rows.length === 0) {
      return normalMsg(res, 400, false, "Service not found");
    }

    const updateData = await pool.query(
      'INSERT INTO service_request (provider_id, customer_id, service_id, description, status, customer_address, booking_time, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, current_timestamp) RETURNING *',
      [providerIdData.rows[0].providerId, user.id, serviceId, description, 'pending', customerAddress, bookingTime]
    );

    return res.status(200).json(updateData.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Get requests for a particular service
router.get('/', authenticateToken, async (req, res, next) => {

  const parameters = req.query;

  const user = req.user;

  if (user.status === 'admin') {
    return res.status(200).json([]);
  }

  try {
    let sqlQuery = `SELECT service_request.id, service_id, service_request.description, service_request.status, service_request.customer_address AS "customerAddress", service_request.booking_time AS "bookingTime", service_request.created_at AS "createdAt"`
    
    if (!parameters.serviceId) {
      sqlQuery += ', service.title, service.price, service.category'
    }

    if (user.status === 'customer') {
      sqlQuery += ' FROM service_request' 

      if (!parameters.serviceId) {
        sqlQuery += ' INNER JOIN service ON service_request.service_id = service.id'
      }

      sqlQuery += ` WHERE service_request.customer_id = ${user.id}`
    } else {
      sqlQuery += ', customer.first_name AS "customerFirstName", customer.last_name AS "customerLastName", customer.profile_image AS "customerProfileImage"'

      sqlQuery += ' FROM service_request INNER JOIN customer ON service_request.customer_id = customer.id'

      if (!parameters.serviceId) {
        sqlQuery += ' INNER JOIN service ON service_request.service_id = service.id'
      }

      sqlQuery += ` WHERE service_request.provider_id = ${user.id}`
    }

    if (parameters.serviceId) {
      sqlQuery += ` AND service_id = ${parameters.serviceId}`
    }

    sqlQuery += ' ORDER BY service_request.created_at DESC'

    console.log(sqlQuery);

    const data = await pool.query(sqlQuery);

    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err)
  }
});

// Routes for a specific service request id
router.use('/:serviceRequestId', serviceRequestIdRoute)

// Routes for the updates of a service request
router.use('/:update', updateRoute)

module.exports = router;