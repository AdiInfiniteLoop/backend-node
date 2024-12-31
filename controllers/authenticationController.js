const util = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const ErrorClass = require('../utils/errorClass');
const SendEmail = require('../utils/email');
const argon2 = require('argon2');
const crypto = require('crypto');



const signup = catchAsync(async (req, res, next) => {



  const newUser = await User.create({
    role: req.body.role,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
 const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES,
  });

  const cookieOptions = {
    maxAge: new Date(Date.now() + parseInt(process.env.EXPIRES,10) * 24 * 60 * 60 * 1000),
    //secure: true, only for production
    httpOnly: true,
  }


  newUser.password = undefined

  res.cookie('jwt', token, cookieOptions)
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new ErrorClass('Invalid Email Or Password', 401)); //Unauthorized 401
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: process.env.EXPIRES,
    });
    res.status(200).json({
      message: 'done',
      token,
    });
  } else {
    return next(new ErrorClass('Please Enter Valid Email and Password', 400));
  }
});

const protect = catchAsync(async (req, res, next) => {
  //get token and see if it is there
  //validate the token
  //if user exists and send the data or error depending on the token validate
  //if user changed password after the token was issued
  let token;
  if (
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) ||
    req.headers.authorization.startsWith('bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorClass('You are not logged in', 401));
  }

  //need to promisify the .verify for the third parameter as a callback
  const verified = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_KEY,
  );
  const isUserExists = await User.findById(verified.id);

  if (!isUserExists) {
    return next(
      new ErrorClass('The User belonging to the token Does Not Exists', 404),
    );
  }

  //check if user password is changed after token is issued
  if (isUserExists.changedPasswordAfter(verified.iat)) {
    return next(
      new ErrorClass(
        'User Recently Changed password! Please Log In Again',
        401,
      ),
    );
  }
  req.user = isUserExists; //to be used in restrictTo
  next();
});

//we cannot pass parameters to middlewares that's why we are wrapping the middleware in a function
const restrictTo = (...roles) => {
  return (req, res, next) => {
    //...roles creates an array

    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      console.log('herer');
      return next(new ErrorClass('No Permission', 403));
    }

    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  //1/ Get User  based on the EMail got from the user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorClass('No such User Found', 404));
  }
  //2/ Generate the random reset token
  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  //3/send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`;

  const message = `Forgot Your Password ? Send a request with your new password and passwordConfirm to ${resetURL}`;

  try {
    await SendEmail({
      email: user.email,
      subject: 'Your password reset token is valid for 10 minutes',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token Sent to Email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorClass('There was an error sending the email', 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  //1. get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //2. if token is valid and user exists, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorClass('Token is invalid or has expired', 400));
  }

  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new ErrorClass('Please provide password and password confirmation', 400),
    );
  }

  if (req.body.password.length < 8) {
    return next(
      new ErrorClass('Password must be at least 8 characters long.', 400),
    );
  }

  //3. update the changedPasswordAt property for the user

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  //4 logged the user in and send JWT
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES,
  });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    token,
  });
});

const updatePassword = catchAsync(async(req, res, next) => {

  const {email, password,  newpassword, newpasswordConfirm} = req.body
  //1. Get User from collection
  //Prevalidation
  if(newpassword.length < 8) {
   return next(new ErrorClass('Password Length of 8 is required', 400))
  }
  if(newpassword === password) {
    return next(new ErrorClass('Kindly Choose a Different Password from before.', 400))
  }
  if(!(newpassword === newpasswordConfirm)) {
    return next(new ErrorClass('Entered Password Confirmation Faile', 400))
  }



  const user = await User.findOne({email: email}).select('+password')
  if(!user) {
    return next(new ErrorClass('No such User Found', 400))
  }
  //2. Verify the entered Password
  if( !(await user.correctPassword(password, user.password))) {

    return next(new ErrorClass('Invalid Password. Kindly retry', 401))
  }   

  //Update the password
  user.password = newpassword
  user.passwordConfirm = newpasswordConfirm
  await user.save()
  //resend JWT
  
    console.log(user.password, "after update")
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES,
  });

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    token,
  });
})

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  updatePassword,
  resetPassword,
};
