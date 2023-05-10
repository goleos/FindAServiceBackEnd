// Require dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload')

// Require Middleware
const middlewares = require('./middlewares');
const providerRoute = require('./routes/provider/provider');
const customerRoute = require('./routes/customer/customer');
const adminRoute = require('./routes/admin/admin');
const serviceRoute = require('./routes/service/service');
const profileUpdateRoute = require('./routes/profileUpdate/profileUpdate');
const serviceRequestRoute = require('./routes/serviceRequest/serviceRequest');
const reviewRoute = require('./routes/review/review');
const notificationRoute = require('./routes/notification/notification');

// Create app
const app = express();

// App middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello 🌏!'
  })
});

// Routes
app.use('/provider', providerRoute);
app.use('/customer', customerRoute);
app.use('/admin', adminRoute);
app.use('/service', serviceRoute);
app.use('/profileUpdate', profileUpdateRoute);
app.use('/serviceRequest', serviceRequestRoute);
app.use('/review', reviewRoute);
app.use('/notification', notificationRoute);

// Error handling middleware
app.use(middlewares.errorHandler);

// Listen for requests
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server started on port ${port}!`)
  });
}