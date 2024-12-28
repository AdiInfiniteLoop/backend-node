const express = require('express')

const userController = require('../controllers/userController')
const userRouter = express.Router();

userRouter.route('/').get(userController.getUsers).post(userController.createUser)
userRouter.route('/:id').get(userController.getUser).delete(userController.deleteUser).patch(userController.updateUser)

module.exports = userRouter
