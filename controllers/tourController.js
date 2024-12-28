const fs =require('fs')
const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')

function aliasTopTours (req, res, next) {
  req.query.limit = '3'
  req.query.sort = 'price,-ratingsAverage'
  next()
}




async function getAllTours(req, res) {
  try {
    console.log(JSON.stringify(req.query))

    //Tour.find() initializes a query Object: A Query Object is an instance of  Query Class used to execute commands in mongo
    //And, it is different from the express req obviously


    //**Tour.find() -> Query Object from the Mongo Class
    //**await Tour.find() -> Immediate return of all the documents


    //find(), skip(), etc returns a new query Object, so must reassign it
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().fields().pagination()
    const tours = await features.query;


    res.status(200).json({message: 'Successfully Fetched', data: {
      tours
    }})

  }
  catch(err) {
    console.log(err)
    res.status(404).json({message: err.message})
  }

}

async function postTour(req, res) {
  try {
    await Tour.create(req.body)
    //const tour = new Tour({...}); tour.save()
    res.status(200).json({message: 'Successfully Created'})
  }
  catch(er) {
    res.status(400).json({message: 'Bad Request'})
  }

}
async function getTourById(req, res) {
  try {
    const tour = await Tour.findById(req.params.id);
    //const tour = Tour.findOne({id: ...})
    res.status(200).json({message: 'Successfully Sent', data: {
      tour
    }}) 
  }
  catch(er) {
    res.status(404).json({message: 'Not Found'})
    console.log(er.message)
  }
}

async function deleteTour(req, res) {
  try {
    await Tour.findByIdAndDelete(req.params.id)
    //await Tour.deleteOne({id: ...})
    res.status(200).json({message: 'Successfully Deleted '})
  }
  catch(er) {
    res.status(400).json({message: 'Bad Request'})
    //can be so many errors here
  }
}

async function updateTour(req, res) {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    res.status(200).json({message: 'Successfully Updated', data: {tour}})
  }
  catch(er) {
    console.log(er.message)
    res.status(404).json({message: 'Cannot find such Tour'})
  }
}

module.exports = {
  getAllTours, 
  getTourById,
  postTour,
  deleteTour,
  updateTour,
  aliasTopTours
}
