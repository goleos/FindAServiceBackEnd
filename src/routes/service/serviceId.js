// /service/:serviceId
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');
const { authenticateToken } = require('../../middlewares');
const { uploadServiceImage } = require('../../config/azureStorageConfig.js');
const path = require('path');
const { SERVICE_IMAGE } = require('../../helpers/contants');

// Get a service
router.get('/', authenticateToken, async (req, res, next) => {
  const { serviceId } = req.params;

  const user = req.user;

  try {
    const serviceData = await pool.query(
      'SELECT service.id, service.title, service.description, service.provider_id AS "providerId", service.price, service.areas_covered AS "areasCovered", service.availability, service.category, service.service_images AS "serviceImages", service.is_available AS "isServiceAvailable", provider.first_name AS "providerFirstName", provider.last_name AS "providerLastName", provider.profile_image AS "providerProfileImage", provider.email AS "providerEmail", provider.is_available AS "isProviderAvailable", provider.is_approved AS "isProviderApproved" FROM service INNER JOIN provider ON service.provider_id = provider.id WHERE service.id = $1',
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

// Upload service image
router.post("/upload", authenticateToken, async (req, res, next) => {
  const user = req.user;
  const { serviceId } = req.params;

  try {

    // If no images was selected uplioad default one
    if (Object.keys(req.files).length === 0) {
      await pool.query(
        'UPDATE service SET service_images = $1 WHERE id = $2 AND provider_id = $3;',
        [`\{${SERVICE_IMAGE}\}`, user.id, user.id]
      )

      return normalMsg(res, 200, true, "OK");
    }

    // Upload images
    const images = []

    for (const file in req.files) {
      const serviceImage = req.files[file]

      const toUpload = serviceImage;
      toUpload.name = `${file}${path.extname(serviceImage.name)}`;

      const serviceImageUrl = await uploadServiceImage(serviceImage, user.id, serviceId);

      images.push(serviceImageUrl)
    }

    await pool.query(
      'UPDATE service SET service_images = $1 WHERE id = $2 AND provider_id = $3;',
      [`\{${images.join(", ")}\}`, serviceId, user.id]
    )
  
    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
});

module.exports = router;