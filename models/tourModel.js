const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name']
//    validate: validator.isAlpha -> using validator npm library
  },
  duration: {
    type:Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: Number,
  difficulty: {
    type: String, 
    required: [true, 'A tour must have a difficulty mode']
  },
  ratingsAverage: Number,
  ratingsQuantity: Number,
  priceDiscount : {
    type: Number,
    validate: {
      validator: function(input) {
        return this.price >= input;
      },
      message: 'Price Discount  {VALUE} must be less than the price itself'
    }
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a summary'],
    trim: true,
  },
  description: {
    type: [String],
    minlength: [10, 'Description must be 10 words of length'],
    maxlength: [200, 'At max of 200 words length of description']
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: {
    type: [String]
  },
  startDates: {
    type: [Date],
    default: Date.now()
  },
  secret : {
    type: Boolean,
    default: false
  }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  })

//virtual fields
tourSchema.virtual('durationByWeeks').get(function() {
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
/*Aggregation middleware*/ 
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({$match: {secretTour : {$ne : true}}})
  next()
})
  
//Model Creation 

const Tour = mongoose.model('Tour', tourSchema)


module.exports = Tour
