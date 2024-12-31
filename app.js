const express = require("express");
const app = express();
const ErrorClass = require('./utils/errorClass')
const globalErrorHandler = require('./controllers/errorController')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss  = require('xss-clean')
const hpp = require('hpp')

const limiter = rateLimit({
  max: 100, //MAX REQUEST
  windowMs: 60 * 60 * 1000,  //TIMWE WINDOW
  message: 'Too many requests from this IP, try again in an hour'
})

//rate limiter
app.use('/api', limiter)
//set security headers
app.use(helmet())

//reads the data in request body
app.use(express.json({limit: '20kb'}))

//data sanitization against NoSQL injection  //{email : {$gt: ""}}
app.use(mongoSanitize())
//data sanitization against XSS
app.use(xss())

//parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'difficulty', 'price']
}))

app.use(express.static(`${__dirname}/public`))
const tourRouter  = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')



//Mounting middlewares
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

//Handling Unhandled Routes
app.all('*', (req, res ,next) => {
  next(new ErrorClass(`cannot find ${req.originalUrl} in the server`, 404))
})
app.use(globalErrorHandler)


module.exports = app
