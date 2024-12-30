const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/userModel')


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

  res.status(200).json({message: 'User route'})
}
function updateUser(req, res) {

  res.status(200).json({message: 'User route'})
}

module.exports = {
  getUsers, createUser, getUser, updateUser, deleteUser
}
