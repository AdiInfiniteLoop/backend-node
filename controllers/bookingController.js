const stripe = require('stripe')(`${process.env.STRIPE_SECRET_KEY}`);
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Get the currently booked tour
  console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);

  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'No tour found with that ID',
    });
  }

  // 2. Create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    customer_email: req.user.email, // Assuming the user is authenticated
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [tour.imageCover], // Use absolute URLs for images
          },
          unit_amount: tour.price * 100, // Stripe expects amounts in cents
        },
        quantity: 1,
      },
    ],
  });

  // 3. Send the session to the client
  res.status(200).json({
    status: 'success',
    session,
  });
});
