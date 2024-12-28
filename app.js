const express = require("express");
const app = express();


app.use(express.json())
app.use(express.static(`${__dirname}/public`))
const tourRouter  = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')



//Mounting middlewares
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app
