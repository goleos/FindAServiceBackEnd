const { authenticateToken } = require("../../middlewares");
const { pool } = require("../../config/postgresConfig");
require("dotenv").config();
const router = require("express").Router();

// Searching for services based on provider, category or area
router.get("/services", authenticateToken, async (req, res, next) => {
  // const user = req.user;
  const parameters = req.query;

  let sqlQuery =
    'SELECT id, title, provider_id AS "providerID", description, price, areas_covered AS "areasCovered", availability, category, is_available AS "isAvailable"' +
    " FROM service";

  if(parameters.area || parameters.provider || parameters.category) {
    sqlQuery += ' WHERE '
  }

  if (parameters.provider) {
    sqlQuery += ` service.provider_id = '${parameters.provider}'`;
  }

  if (parameters.category) {
    sqlQuery += ` AND category = '${parameters.category}'`;
  }

  // how to check value is present in an array:
  // https://stackoverflow.com/questions/39643454/postgres-check-if-array-field-contains-value
  if (parameters.area) {
    sqlQuery += ` AND '${parameters.area}' = ANY(service.areas_covered)`;
  }

  try {
    const data = await pool.query(sqlQuery);

    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err);
  }
});

// creating a service by provider. Note that it has to be then approved by admin.
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
