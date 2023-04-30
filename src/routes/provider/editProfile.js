// /provider/editProfile
require('dotenv').config();
const router = require('express').Router({ mergeParams: true });
const { pool } = require('../../config/postgresConfig');
const { normalMsg } = require('../../helpers/returnMsg');
const { authenticateToken } = require('../../middlewares');
const { uploadProfileImage } = require('../../config/azureStorageConfig.js');
const bcrypt = require('bcrypt');
const path = require('path');

// Edit provider information
router.put('/', authenticateToken, async (req, res, next) => {

  const user = req.user;

  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    description,
    address,
    profileImage
  } = req.body;

  // Check passwords match
  if (password !== confirmPassword) {
    return normalMsg(res, 400, false, "Passwords don't match");
  }

  // Check email exists Postgresql
  try {
    const data = await pool.query(
      'SELECT id, is_approved FROM provider WHERE provider.email = $1 AND id != $2',
      [email, user.id]);

    if (data.rows.length !== 0) {
      return normalMsg(res, 400, false, "Email already exists");
    }

    // Update profile info
    await bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        res.status(500);
        next(err)
      }

      await pool.query(
        'UPDATE provider SET email = $1, password = $2, first_name = $3, last_name = $4, profile_image = $5, description = $6, address = $7, is_approved = false WHERE id = $8',
        [email, hash, firstName, lastName, profileImage, description, address, user.id]);

      return normalMsg(res, 201, true, "OK");
    });

  } catch (err) {
    res.status(500);
    next(err);
  }
})

// Upload profile image
router.post('/upload', authenticateToken, async (req, res, next) => {

  const user = req.user;

  try {
    // Add paths to db
    if (req.files) {
      const toUpload = req.files.profileImage;
      toUpload.name = `profileImage${path.extname(toUpload.name)}`;

      const profileImageUrl = await uploadProfileImage(toUpload, user.id);

      await pool.query(
        'UPDATE provider SET profile_image = $1 WHERE id = $2;',
        [profileImageUrl, user.id]
      )
    }
    return normalMsg(res, 200, true, "OK");
  } catch (err) {
    res.status(500);
    next(err)
  }
})

module.exports = router;