// /admin
require('dotenv').config();
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { loginMsg } = require('../../helpers/returnMsg');
const { pool } = require('../../config/postgresConfig');

// Login the admin
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return loginMsg(res, 400, false, "Bad Request", false);
  }

  // Check password
  if (email === "admin@yahoo.com" && password === "admin") {
    const token = jwt.sign(
      { id: 1, status: "admin" },
      process.env.TOKEN_SECRET
    );
    return loginMsg(res, 200, true, "OK", token);
  } else {
    return loginMsg(res, 401, false, "Invalid credentials", false);
  }
});

module.exports = router;