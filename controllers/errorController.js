
const ErrorClass = require('../utils/errorClass')



function sendErrorData(err, res) {
  console.log('upddate error', err) 
  if(err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  else {
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });      
  }
}  

function handleCastErrorDB(err)
{
  err.message = `Invalid Id; ${err.value}` 
  return new ErrorClass(err.message, 400)
}

function handleDuplicateKey(err) {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)
  err.message = `ID : ${value[0]} already present in the Database` 
  return new ErrorClass(err.message, 400)

}
const handleJWTError = err => new ErrorClass('Invalid Token. Please Try Again', 401)

const tokenExpiredError = err => new ErrorClass('Token Expired. Please Try Again', 401)

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if(err.name === 'CastError') err = handleCastErrorDB(err)
  if(err.code === 11000) err = handleDuplicateKey(err)
  if(err.name === 'JsonWebTokenError') err = handleJWTError(err)
  if(err.name === 'TokenExpiredError') err = tokenExpiredError(err)

if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);

    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors, // List of validation error messages
    });
  }
  sendErrorData(err, res)

};
