// /service
const { authenticateToken } = require("../../middlewares");
const { pool } = require("../../config/postgresConfig");
require("dotenv").config();
const router = require("express").Router();

const serviceIdRoute = require('./serviceId');

// Searching for services based on provider, category or area
router.get("/services", authenticateToken, async (req, res, next) => {
  // const user = req.user;
  const parameters = req.query;

  let sqlQuery =
    'SELECT service.id, service.title, provider_id AS "providerID", service.description, service.price, service.areas_covered AS "areasCovered", service.availability, service.category, service.service_images AS "serviceImages", service.is_available AS "isAvailable", provider.first_name AS "providerFirstName", provider.last_name AS "providerLastName", provider.profile_image AS "providerProfileImage", ROUND(AVG(review.rating), 2) AS "avgRating" FROM service INNER JOIN provider ON service.provider_id = provider.id LEFT JOIN review ON service.id = review.service_id';

  sqlQuery += ' WHERE provider.is_approved = true AND provider.is_available = true AND service.is_available = true'

  if (parameters.provider) {
    sqlQuery += ` AND service.provider_id = '${parameters.provider}'`;
  }

  if (parameters.category) {
    sqlQuery += ` AND category = '${parameters.category}'`;
  }

  // how to check value is present in an array:
  // https://stackoverflow.com/questions/39643454/postgres-check-if-array-field-contains-value
  if (parameters.area) {
    sqlQuery += ` AND '${parameters.area}' = ANY(service.areas_covered)`;
  }

  /**
   * This post helped with partial search for a list
   * https://stackoverflow.com/questions/7222106/postgres-query-of-an-array-using-like
   */
  if (parameters.searchQuery) {
    const query = parameters.searchQuery;

    sqlQuery += ` AND (lower(provider.first_name) LIKE lower('%${query}%') OR lower(provider.last_name) LIKE lower('%${query}%') OR lower(service.title) LIKE lower('%${query}%') OR lower(service.description) LIKE lower('%${query}%') OR service.category = '${query}'`;

    sqlQuery += ` OR (0 < (SELECT COUNT(*) FROM unnest(areas_covered) AS area WHERE lower(area) LIKE lower('%${query}%')))`

    sqlQuery += ` OR (0 < (SELECT COUNT(*) FROM unnest(availability) AS available WHERE lower(available) LIKE lower('%${query}%'))))`
  }

  sqlQuery += " GROUP BY service.id, service.title, provider_id, service.description, service.price, service.areas_covered, service.availability, service.category, service.service_images, service.is_available, provider.first_name, provider.last_name, provider.profile_image"

  try {
    const data = await pool.query(sqlQuery);

    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// creating a service by provider.
router.post("/create", authenticateToken, async (req, res, next) => {
  const user = req.user;

  if (user.status !== 'provider') {
    return res.status(401).json({ status: false, message: "Unauthorised" });
  }

  // Add service
  const body = req.body;

  let sqlQuery = `INSERT INTO public.service (id, title, description, provider_id, price, areas_covered,
 availability, category, is_available) VALUES 
 (DEFAULT, 
 '${body.title}', 
 '${body.description}', 
 ${user.id}, 
 ${body.price}, 
 '\{${body.areas_covered.join(", ")}\}', 
 '\{${body.availability.join(", ")}\}', 
 '${body.category}'::service_category_name, DEFAULT) RETURNING id`;

  try {
    const newService = await pool.query(sqlQuery);

    // Notify all the customer's that have 
    // used their services in the past
    const customers = await pool.query(
      'SELECT DISTINCT customer_id AS "customerId" FROM service_request WHERE provider_id = $1',
      [user.id]);

    for (let row of customers.rows) {
     
      await pool.query(
        'INSERT INTO notification (provider_id, customer_id, service_id, type) VALUES ($1, $2, $3, $4)',
        [user.id, row.customerId, newService.rows[0].id, 'new_service']);
    }

    return res.status(200).json(newService.rows[0].id);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

router.post("/update", authenticateToken, async (req, res, next) => {
  const user = req.user;
  const body = req.body;
  const parameters = req.query;

  if (!parameters.service_id) {
    return res.status(400).json({ status: false, message: "You didn't use the 'service_id' parameter" });
  }

  //Todo: check that this service is actually owned by the provider

  if (user.status !== 'provider') {
    return res.status(401).json({ status: false, message: "Unauthorised" });
  }

  let sqlQuery = `UPDATE public.service 
        SET 
        title =  '${body.title}', 
        description =  '${body.description}',
        price =  ${body.price},
        areas_covered =  '\{${body.areas_covered.join(", ")}\}', 
        availability =  '\{${body.availability.join(", ")}\}', 
        category =  '${body.category}'::service_category_name
        WHERE
        id= ${parameters.service_id}
        `;

  try {
    await pool.query(sqlQuery);

    return res.status(200).json({ status: true, message: "Success" });
  } catch (err) {
    res.status(500);
    next(err);
  }

  
})

router.delete("/delete", authenticateToken, async (req, res, next) => {
  const user = req.user
  const parameters = req.query;

  if (!parameters.service_id) {
    return res.status(400).json({ status: false, message: "You didn't use the 'service_id' parameter" });
  }

  //Todo: check that this service is actually owned by the provider

  if (user.status !== 'provider') {
    return res.status(401).json({ status: false, message: "Unauthorised" });
  }

  let sqlQuery = `UPDATE public.service SET is_available = false WHERE id = ${parameters.service_id}`;

  try {
    await pool.query(sqlQuery);

    return res.status(200).json({ status: true, message: "Success" });
  } catch (err) {
    res.status(500);
    next(err);
  }


})

// Routes for a specific service id
router.use('/:serviceId', serviceIdRoute)

module.exports = router;
