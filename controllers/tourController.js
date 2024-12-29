const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const ErrorClass = require('../utils/errorClass');

function aliasTopTours(req, res, next) {
  req.query.limit = '3';
  req.query.sort = 'price,-ratingsAverage';
  next();
}

const getAllTours = catchAsync(async (req, res, next) => {
  //    console.log(JSON.stringify(req.query))

  //Tour.find() initializes a query Object: A Query Object is an instance of  Query Class used to execute commands in mongo
  //And, it is different from the express req obviously

  //**Tour.find() -> Query Object from the Mongo Class
  //**await Tour.find() -> Immediate return of all the documents

  //find(), skip(), etc returns a new query Object, so must reassign it
  const features = new APIFeatures(Tour.find(), req.query)
  .filter()
  .sort()
  .fields()
  .pagination();
  const tours = await features.query;
  res.status(200).json({
    message: 'Successfully Fetched',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const postTour = catchAsync(async (req, res, next) => {
  await Tour.create(req.body);
  //const tour = new Tour({...}); tour.save()
  res.status(200).json({ message: 'Successfully Created' });
});

const getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new ErrorClass('No Tour Found with that ID', 404));
  }
  res.status(200).json({
    message: 'Successfully Sent',
    data: {
      tour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new ErrorClass('No Tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Successfully Deleted',
    data: {tour}
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if(!tour) {
    return next(new ErrorClass('No Tour found with that ID', 404))
  }
  res.status(200).json({ message: 'Successfully Updated', data: { tour } });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 }, difficulty: { $ne: 'easy' } } },
    {
      $group: {
        _id: '$difficulty',
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        totalPrice: { $sum: '$price' },
        numTours: { $sum: 1 },
      },
    },
    //{$sum : 1} is an accumulator
    { $sort: { totalPrice: 1 } }, //Field Paths does not start with $, 1:ascending, -1:descending
  ]);

  if(!tour) {
    return next(new ErrorClass('No Tour found with that ID', 404))
  }
  res.status(200).json({ message: 'success', data: stats });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const tours = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } }, //renamed _id to month
    { $sort: { numTours: -1 } },
    { $project: { _id: 0 } },

  ]);
    //**$->mongo operators, when referencing other field names e.g. { $addFields: {month: '$_id'}} _id is other field
    //**no need for $ for first field Name we are interacting
    /*
 MongoDB Operators (e.g., $gte, $sum, $avg, $match, etc.):

    The $ is used in front of operators to tell MongoDB you're using an operator rather than a plain value or field name.
    Example: { $gte: 10 } — Here, $gte is a MongoDB operator, so it uses the $.

Referencing Document Fields (e.g., $_id, $startDates, $name):

    When you're referring to field names in expressions (especially within aggregation stages like $group, $addFields, etc.), you use the $ in front of the field name to indicate that it's a field reference.
    Example: { $addFields: { month: '$_id' } } — In this case, you're referencing the _id field from the previous stage and renaming it as month. The $ tells MongoDB it's referring to the field name, not a static value.

Field Names (e.g., startDates, name, customer):

    When you're referring to document field names in MongoDB queries or aggregations directly (i.e., in $match, $project, etc.), you do not use the $ in front of the field names.
 */

  if(!tour) {
    return next(new ErrorClass('No Tour found with that ID', 404))
  }
  res.status(202).json({ message: 'Success', data: tours });
});

module.exports = {
  getAllTours,
  getTourById,
  postTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
