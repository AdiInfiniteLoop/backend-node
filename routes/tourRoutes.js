const express = require('express');
const authenticationController = require('../controllers/authenticationController');
const tourController = require('../controllers/tourController');
const reviewRouter = require('../routes/reviewRoutes');
const tourRouter = express.Router();

tourRouter
  .route('/top-3-cheaptours')
  .get(tourController.aliasTopTours, tourController.getAllTours);
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter
  .route('/monthly-plan/:year')
  .get(
    authenticationController.restrictTo('admin', 'lead-guide', 'user'),
    tourController.getMonthlyPlan
  );
//For specific middlewares: (Chaining multiple middlewares)
//tourRouter.route({..route}).post(middleware1, middleware2, .., postrequest)

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//Geospatial route
//  /tours-within/:100/center/:34,32/unit/kms '); //Geospatial route

tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

tourRouter
  .route('/')
  .get(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.getAllTours
  )
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
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  );

tourRouter.use('/:tourId/review', reviewRouter);

module.exports = tourRouter;
