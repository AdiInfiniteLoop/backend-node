const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const authenticationController = require('../controllers/authenticationController');

userRouter.post('/signup', authenticationController.signup);
userRouter.post('/login', authenticationController.login);
userRouter.post('/forgotpassword', authenticationController.forgotPassword);
userRouter.patch(
  '/resetpassword/:token',
  authenticationController.resetPassword,
);
userRouter.patch('/updatepassword', authenticationController.updatePassword)
userRouter.patch('/updateme', authenticationController.protect, userController.updateMe)
userRouter.delete('/deleteme', authenticationController.protect, userController.deleteMe)

userRouter
  .route('/')
  .get(userController.getUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = userRouter;
