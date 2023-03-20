const jwt = require('jsonwebtoken');

// Catch error and return the error messahe and status code
const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  return res.json({
    status: false,
    message: error.message,
    stack: error.stack
  });
}

// Check authentication token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) {
    return res.status(403).json({ status: false, message: "Unauthorised" });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

    if (err) return res.status(403).json({ status: false, message: "Unauthorised" });

    console.log(user);

    req.user = user

    next()
  })
}

module.exports = {
  errorHandler,
  authenticateToken
}