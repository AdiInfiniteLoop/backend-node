const catchAsync = require('../utils/catchAsync');
const ErrorClass = require('../utils/errorClass');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new ErrorClass('No doc found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully Deleted',
      data: { doc },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new ErrorClass('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully Updated',
      data: { doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    //const Model = new Model({...}); Model.save()
    res.status(200).json({
      status: 'success',
      message: 'Successfully Created',
      data: { doc },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new ErrorClass('No doc Found with that ID', 404));
    }
    res.status(200).json({
      message: 'Successfully Sent',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //NESTED Routes
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();
    const doc = await features.query;
    res.status(200).json({
      message: 'Successfully Fetched',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
