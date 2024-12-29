const express = require("express");
const app = express();
const ErrorClass = require('./utils/errorClass')
const globalErrorHandler = require('./controllers/errorController')


app.use(express.json())
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
