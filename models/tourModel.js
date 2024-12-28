const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name']
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
  }
})

//Model Creation 
const Tour = mongoose.model('Tour', tourSchema)


module.exports = Tour
