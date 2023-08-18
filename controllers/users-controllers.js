const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({ getters: true }))});
};

const getUserItemsByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithItems;
  try {
    userWithItems = await User.findById(userId).populate('items');
  } catch (err) {
    const error = new HttpError(
      'Fetching items failed, please try again later',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithItems || userWithItems.items.length === 0) {
    return next(
      new HttpError('Could not find items for the provided user id.', 404)
    );
  }

  res.json({
    items: userWithItems.items.map(item =>
      item.toObject({ getters: true })
    )
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
  
  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }
  
  const createdUser = new User({
    name,
    email,
    password,
    items: []
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({message: 'Success! You have logged in. Please Login using the login form on the left', user: createdUser.toObject({ getters: true })});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  res.json({message: 'Logged in!', user: existingUser.toObject({getters: true})});
};

exports.getUsers = getUsers;
exports.getUserItemsByUserId = getUserItemsByUserId;
exports.signup = signup;
exports.login = login;
