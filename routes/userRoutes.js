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

userRouter.get(
  '/me',
  authenticationController.protect,
  userController.getMe,
  userController.getUser
);
userRouter.patch('/updatepassword', authenticationController.updatePassword);
userRouter.patch(
  '/updateme',
  authenticationController.protect,
  userController.updateMe
);
userRouter.delete(
  '/deleteme',
  authenticationController.protect,
  userController.deleteMe
);

userRouter.route('/').get(userController.getUsers).post(
  authenticationController.protect,
  authenticationController.restrictTo('admin'), //Incase admin wants to create users
  userController.createUser
);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .delete(
    authenticationController.protect,
    authenticationController.restrictTo('admin'),
    userController.deleteUser
  )
  .patch(
    authenticationController.protect,
    authenticationController.restrictTo('user', 'admin'),
    userController.updateUser
  );

module.exports = userRouter;
