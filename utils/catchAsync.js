//Higher Order Function for Error handling
//const catchAsync = (fn) => (req, res, next) =>{
 // return (req, res, next) => {
  //  fn(req, res, next).catch(next)
  //}
//}

const catchAsync = (fn) => { return (req, res, next) => {
  fn(req, res, next).catch(next);
} };

module.exports = catchAsync
