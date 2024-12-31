const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')
const ErrorClass = require('../utils/errorClass')

const  getUsers = catchAsync(async function (req, res, next) {
 const features = new APIFeatures(User.find(), req.query)
  .filter()
  .sort()
  .fields()
  .pagination();
  const users = await features.query;
  res.status(200).json({
    message: 'Successfully Fetched',
    results: users.length,
    data: {
      users,
    },
  });
})


function createUser(req, res) {

  res.status(200).json({message: 'User route'})
}

function getUser(req, res) {

  res.status(200).json({message: 'User route'})
}
function deleteUser(req, res) {
  //we do not delete it rather make it inactive
}
function updateUser(req, res) {

  res.status(200).json({message: 'User route'})
}

const filterUnwantedFields = (obj, ...allowedFields) => {
const newObj = {}
  Object.keys(obj).forEach(el => {
  if(allowedFields.includes(el)) newObj[el] = obj[el]
})
return newObj;
}

const deleteMe = catchAsync(async function(req, res, next) {
  await User.findByIdAndUpdate(req.user.id, {active: false})
  res.status(204).json({
    status: 'success',
    data: null
  })
})

const updateMe = catchAsync(async function (req, res, next) {
  // 1.create when user tries to update password
  //2. else update user document 
  
  //Only email and password as we do not want anyone to put role as  admin

  if(req.body.password || req.body.passwordConfirm) {
    return next(new ErrorClass('You cannot update your password here. Kindly use /updatepassword route to do so', 400))
  }


  const filteredObj = filterUnwantedFields(req.body, 'name', 'email');
  const  updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj ,{
    new: true,
    runValidators: true
  })

  

  res.status(200).json({
      status: 'success',
      data : {
        user: updatedUser
      }
    })
})

module.exports = {
  getUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe
}
