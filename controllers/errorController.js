
const ErrorClass = require('../utils/errorClass')



function sendErrorData(err, res) {
  if(!err.isOperational) {
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

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if(err.name === 'CastError') err = handleCastErrorDB(err)
  if(err.code === 11000) err = handleDuplicateKey(err)

  sendErrorData(err, res)

};
