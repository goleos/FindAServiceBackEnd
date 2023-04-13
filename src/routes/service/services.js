const { authenticateToken } = require("../../middlewares");
const { pool } = require("../../config/postgresConfig");
require("dotenv").config();
const router = require("express").Router();

// Get services of the current provider
router.get("/services", authenticateToken, async (req, res, next) => {
  // const user = req.user;
  const body = req.body;

  let sqlQuery =
    'SELECT id, title, provider_id AS "providerID", description, price, areas_covered AS "areasCovered", availability, category, is_available AS "isAvailable"' +
    " FROM service" + ' WHERE ';

  if (body.provider) {
    sqlQuery += ` service.provider_id = '${body.provider}'`;
  }

  if (body.category) {
    sqlQuery += ` AND category = '${body.category}'`;
  }

  // how to check value is present in an array:
  // https://stackoverflow.com/questions/39643454/postgres-check-if-array-field-contains-value
  if (body.area) {
    sqlQuery += ` AND '${body.area}' = ANY(service.areas_covered)`;
  }

  try {
    const data = await pool.query(sqlQuery);

    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

router.post("/create", authenticateToken, async (req, res, next) => {
  const user = req.user;

  if (user.status !== 'provider') {
    return res.status(401).json({ status: false, message: "Unauthorised" });
  }

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
 '${body.category}'::service_category_name, DEFAULT)`;

  try {
    await pool.query(sqlQuery);

    return res.status(200).json({ status: true, message: "Success" });
  } catch (err) {
    res.status(500);
    next(err);
  }
});

module.exports = router;
