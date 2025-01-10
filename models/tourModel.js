const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      //    validate: validator.isAlpha -> using validator npm library
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: Number,
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty mode'],
    },
    ratingsAverage: Number,
    ratingsQuantity: Number,
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (input) {
          return this.price >= input;
        },
        message: 'Price Discount  {VALUE} must be less than the price itself',
      },
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: [String],
      minlength: [10, 'Description must be 10 words of length'],
      maxlength: [200, 'At max of 200 words length of description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
      default: Date.now(),
    },
    secret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON to represent Geospatial Data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //latitute(hor), (ver)
    },
    //creating embedded documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //Embed guides document in tour(so user modal in tour modal)
    // guides: Array, -> Embedding
    guides: [
      // to create a relation we reference it
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual fields
tourSchema.virtual('durationByWeeks').get(function () {
  return this.duration / 7;
});
/*
 DOCUMENT MIDDLEWARE *
for .save() and .create()
tourSchema.pre('save', function (next) {
  this.summary = " New Summary"
  next()
})

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
})
*/

/*QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  console.log('Query Middleware executed')
  //restricting certain tours (say in schema if secret then do not show)
  this.find =   this.find({secret: {$ne: true}})
  next();
})

tourSchema.post(/^find/, function(doc, next) {
  next();
})
*/

//Data referencing the guides
// tourSchema.pre('save', async function(next) {
//   const guidePromises = this.guides.map(async (el) => await User.findById(el))
//   this.guides = await Promise.all(guidePromises)
//   next();
// })

tourSchema.virtual('reviews', {
  ref: 'Review', //Model Name
  foreignField: 'tour', //  Specifies the name of the field in the referenced model (Review) that contains the value you want to match.
  localField: '_id', //  The identifier in the current collection/model that you use to find matching documents in the referenced collection.
});

//How to know what to set the index?
//Ans. The parameter that are to be queried the most

tourSchema.index({ price: 1, ratingsAverage: -1 }); //creating indexes for performance

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', // '-' for what we do not want to see
  }); //not tour-guide but the schema name that is populated
  next();
});

/*Aggregation middleware*/
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

//Model Creation

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
