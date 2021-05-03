const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncCatch = require('../utils/asyncCatch');
const AppError = require('../utils/appError');

const signToken = id => {
  return jwt.sign(
    {id: id},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN}
  )
}

exports.signup = asyncCatch (async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jwt.sign(
    {id: newUser._id},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN}
  )

  res
    .status(201)
    .json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    })

})

exports.login = asyncCatch(async (req, res, next) => {
  const {email, password} = req.body;

  //1. if email and password exist
  if(!email || !password) {
   return  next(new AppError('Provide email and password!!!', 400));
  }

  //2. check if user exist and password is correct
      // look for user by email and add password in the response as password in the model selected as false
      // we explicitly select password
  const user = await User.findOne({ email }).select('+password')//
      // correctPasswordMethod is avaiulable for every User instance because we declared it in UserSchema
  if(!user || !(await user.correctPassword(password, user.password))) return next(new AppError('Incorrect email or password', 401))

  //3. if all is ok we share tpken with the client
  const token =signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });

});

exports.protect = asyncCatch( async (req, res, next) => {

  // 1. check that token exist, user is logged in
  let token;
  if(req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new AppError('Token is not added, you are not logged in'));
  }
  // 2. verify the token



  next()
})