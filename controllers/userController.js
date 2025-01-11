const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const ErrorClass = require('../utils/errorClass');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, callbck) => {
//     callbck(null, 'public/img/users');
//   },
//   filename: (req, file, callbck) => {
//     //user-124324bs-23434242dsa.jpeg
//     const extension = file.mimetype.split('/')[1];
//     callbck(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callbck) => {
  if (file.mimetype.startsWith('image')) {
    callbck(null, true);
  } else {
    callbck(new ErrorClass('Not an image! Please upload images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const uploadPhoto = upload.single('photo');

const getUsers = factory.getAll(User);

const createUser = factory.createOne(User); //say for admin that wants to create user

const getUser = factory.getOne(User);

const deleteUser = factory.deleteOne(User);
//DO NOT UPDATE PASSWORDS HERE
const updateUser = factory.updateOne(User);

const resizeUploadedPhotos = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});
const filterUnwantedFields = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const updateMe = catchAsync(async function (req, res, next) {
  // 1.create when user tries to update password
  //2. else update user document

  //Only email and password as we do not want anyone to put role as  admin

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ErrorClass(
        'You cannot update your password here. Kindly use /updatepassword route to do so',
        400
      )
    );
  }

  const filteredObj = filterUnwantedFields(req.body, 'name', 'email');
  if (req.file) {
    filteredObj.photo = req.file.filename;
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

module.exports = {
  getMe,
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  uploadPhoto,
  resizeUploadedPhotos,
};
