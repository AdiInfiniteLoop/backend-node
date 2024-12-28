const express = require('express')

const tourController = require('../controllers/tourController')
const tourRouter = express.Router();

//For specific middlewares: (Chaining multiple middlewares)
//tourRouter.route({..route}).post(middleware1, middleware2, .., postrequest)
tourRouter.route('/').get(tourController.getAllTours).post(tourController.postTour)
tourRouter.route('/:id').get(tourController.getTourById).delete(tourController.deleteTour).patch(tourController.updateTour)

module.exports =  tourRouter 
