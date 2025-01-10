const express = require('express');
const userController = require('../controllers/userController');
const userRouter = express.Router();
const authenticationController = require('../controllers/authenticationController');

userRouter.post('/signup', authenticationController.signup);
userRouter.post('/login', authenticationController.login);
userRouter.post('/forgotpassword', authenticationController.forgotPassword);
userRouter.patch(
  '/resetpassword/:token',
  authenticationController.resetPassword
);

userRouter.use(authenticationController.protect);
  
userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch('/updatepassword', authenticationController.updatePassword);
userRouter.patch('/updateme', userController.updateMe);
userRouter.delete('/deleteme', userController.deleteMe);

userRouter.route('/').get(userController.getUsers).post(
  authenticationController.restrictTo('admin'), //Incase admin wants to create users
  userController.createUser
);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .delete(
    authenticationController.restrictTo('admin'),
    userController.deleteUser
  )
  .patch(
    authenticationController.restrictTo('user', 'admin'),
    userController.updateUser
  );

module.exports = userRouter;
