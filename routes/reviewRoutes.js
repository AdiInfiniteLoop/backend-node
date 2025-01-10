const express = require('express');
const authenticationController = require('../controllers/authenticationController');
const reviewRouter = express.Router({ mergeParams: true }); //mergeParams for reviewRouter to get access to tourId
const reviewController = require('../controllers/reviewController');

//POST /tour/{id}/review
//GETtour/{id}/review
//GETtour/{id}/review/{reviewid}

reviewRouter.use(authenticationController.protect);

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authenticationController.restrictTo('user'),
    reviewController.setTourUsersIds,
    reviewController.postReview
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authenticationController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authenticationController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );
module.exports = reviewRouter;
