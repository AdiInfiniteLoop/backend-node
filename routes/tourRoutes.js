const express = require('express');
const authenticationController = require('../controllers/authenticationController');
const tourController = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRoutes');
const tourRouter = express.Router();

tourRouter
  .route('/top-3-cheaptours')
  .get(tourController.aliasTopTours, tourController.getAllTours);
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
//For specific middlewares: (Chaining multiple middlewares)
//tourRouter.route({..route}).post(middleware1, middleware2, .., postrequest)
tourRouter
  .route('/')
  .get(authenticationController.protect, tourController.getAllTours)
  .post(tourController.postTour);
tourRouter
  .route('/:id')
  .get(tourController.getTourById)
  .delete(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  );

tourRouter.use('/:tourId/review', reviewRouter);

module.exports = tourRouter;
