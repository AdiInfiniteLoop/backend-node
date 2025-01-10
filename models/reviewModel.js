const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must be present'],
    },
    rating: {
      type: Number,
      min: [1, 'Minimum rating must be given'],
      max: [5, 'A maximum of rating 5 must be given'],
      required: [true, 'A rating must be present for a review'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // There need to be a [] as the review is only for one tour
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must be for a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A user must be for a review'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: '-__v -_id',
  // });

  this.populate({
    path: 'user',
    select: 'name email ',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
