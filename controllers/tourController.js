const fs =require('fs')
const Tour = require('../models/tourModel')


async function getAllTours(req, res) {
  try {
    console.log(JSON.stringify(req.query))
    
    //Excluding special field name
    let queryObj = {...req.query}
    const excludedFields = ["page", "sort", "fields", "limit"];
    excludedFields.forEach((el) => delete queryObj[el])
    // 1.filtering: simply put it in model.find(...) from mongo
    

    //2.Advanced filtering
    // model.find({duration: {$gte: 43} } )
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, matched => `$${matched}`)


    let query = Tour.find(JSON.parse(queryStr))
    
    //3. Sorting
    if(req.query.sort) {
      //Tie Breaker Sorting
      //req.query.sort = price,duration,...
      const sortBy = req.query.sort.split(',').join(' ')
      query.sort(sortBy)

    }


    const tours = await query;
    res.status(200).json({message: 'Successfully Fetched', data: {
      tours
    }})

  }
  catch(err) {
    console.log(err)
    res.status(404).json({message: 'No Tours Found'})
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
  updateTour
}
