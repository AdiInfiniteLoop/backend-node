const express = require('express');
const authenticationController = require('../controllers/authenticationController');
const bookingController = require('../controllers/bookingController');
const bookingRouter = express.Router();

bookingRouter.get(
  '/checkout-session/:tourId',
  authenticationController.protect,
  bookingController.getCheckoutSession
);

module.exports = bookingRouter;
