// /review/:reviewId
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { authenticateToken } = require('../../middlewares');
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');

// Delete a particular service request
router.delete('/', authenticateToken, async (req, res, next) => {

  const { reviewId } = req.params;

  const user = req.user;

  if (user.status !== 'admin') {
    return normalMsg(res, 400, false, "Unauthorised")
  }

  try {
    
    await pool.query(
      'DELETE FROM review WHERE id = $1',
      [reviewId]
    );

    return res.normalMsg(res, 200, true, 'OK')
  } catch (err) {
    res.status(500);
    next(err)
  }
});

module.exports = router;