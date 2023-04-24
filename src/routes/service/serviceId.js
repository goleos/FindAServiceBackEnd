// /service/:serviceId
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');
const { authenticateToken } = require('../../middlewares');

// Get a service
router.get('/', authenticateToken, async (req, res, next) => {
  const { serviceId } = req.params;

  const user = req.user;

  try {
    const serviceData = await pool.query(
      'SELECT service.id, service.title, service.description, service.provider_id AS "providerId", service.price, service.areas_covered AS "areasCovered", service.availability, service.category, service.is_available AS "isServiceAvailable", provider.first_name AS "providerFirstName", provider.last_name AS "providerLastName", provider.profile_image AS "providerProfileImage", provider.email AS "providerEmail", provider.is_available AS "isProviderAvailable", provider.is_approved AS "isProviderApproved" FROM service INNER JOIN provider ON service.provider_id = provider.id WHERE service.id = $1',
      [serviceId]
    );

    console.log(serviceData.rows[0]);

    if (serviceData.rows[0].isServiceAvailable && 
      serviceData.rows[0].isProviderApproved && 
      serviceData.rows[0].isProviderAvailable) {
      return res.status(200).json(serviceData.rows[0]);
    } else {
      return res.status(200).json(null);
    }


  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;