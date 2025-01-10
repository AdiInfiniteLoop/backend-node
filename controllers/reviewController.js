const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

const getAllReviews = factory.getAll(Review);

const getReview = factory.getOne(Review);

const setTourUsersIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.params.id;
  next();
};

const postReview = factory.createOne(Review);

const deleteReview = factory.deleteOne(Review);

const updateReview = factory.updateOne(Review);
module.exports = {
  getAllReviews,
  getReview,
  postReview,
  deleteReview,
  updateReview,
  setTourUsersIds,
};
