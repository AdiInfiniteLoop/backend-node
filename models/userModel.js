const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User must have a Name'],
  },
  email: {
    type: String,
    required: [true, 'A User must have an email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (input) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input);
      },
      message: 'Invalid Email',
    },
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'tour-guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A User must have a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Kindly Confirm Your Password'],
    validate: {
      validator: function (input) {
        return this.password === input;
      },
      message: 'Passwords Did Not Match',
    },
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre('save', async function (next) {
  //If modified then there is no need to hash again
  if (!this.isModified('password')) return next();

  //Hash the password (bcrypt ? really??)
  try {
    const hashFormed = await argon2.hash(this.password);
    // console.log(hashFormed, "  is the hash")
    this.password = hashFormed;
    this.passwordConfirm = undefined;
  } catch (err) {
    console.log('hashing err', err);
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //-1000 because token maybe generate around 1s before
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  const isValid =  await argon2.verify(userPassword, candidatePassword);
    console.log(isValid)

    return isValid
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimeStamp < changedTime; //if changed later then return true that pwd is changed
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
