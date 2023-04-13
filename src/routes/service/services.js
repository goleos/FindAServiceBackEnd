const { authenticateToken } = require("../../middlewares");
const { pool } = require("../../config/postgresConfig");
require("dotenv").config();
const router = require("express").Router();

// Get services of the current provider
router.get("/services", authenticateToken, async (req, res, next) => {
  // const user = req.user;
  const parameters = req.query;
  console.log(parameters.provider);

  let sqlQuery =
    'SELECT id, title, description, price, areas_covered AS "areasCovered", availability, category, is_available AS "isAvailable"' +
    " FROM service";

  if (parameters.provider) {
    sqlQuery += ` WHERE service.provider_id = '${parameters.provider}'`;
  } else {
    return res
      .status(400)
      .json({ status: false, message: "Must provide provider parameter" });
  }

  if (parameters.category) {
    sqlQuery += ` AND category = '${parameters.category}'`;
  }

  // how to check value is present in an array:
  // https://stackoverflow.com/questions/39643454/postgres-check-if-array-field-contains-value
  if (parameters.area) {
    sqlQuery += ` AND '${parameters.area}' = ANY(service.areas_covered)`;
  }

  // if (user.status != "provider") {
  //     return res.status(401).json({ status: false, message: "Unauthorised" });
  // }

  console.log(sqlQuery);
  try {
    const data = await pool.query(sqlQuery);

    return res.status(200).json(data.rows);
  } catch (err) {
    res.status(500);
    next(err);
  }
});



module.exports = router;
