const uuid = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Item = require('../models/item');
const User = require('../models/user');

const getAllItems = async (req, res, next) => {
  let item;
  try{
    item = await Item.find();
  } catch (err){
    const error = new HttpError(
      'Something went wrong, could not retrieve all items', 500
    );
    return next(error);
  }
  // res.json({ item: item.toObject({ getters: true }) });
  res.json({item});
}

const getItemById = async (req, res, next) => {
  const itemId = req.params.catId;

  let item;
  try {
    item = await Item.findById(itemId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find an Item.',
      500
    );
    return next(error);
  }

  if (!item) {
    const error = new HttpError(
      'Could not find an Item for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ item: item.toObject({ getters: true }) });
};

const getItemsByUserId = async (req, res, next) => {
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

const createItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, category, cost, date, creator } = req.body;

  const createdItem = new Item({
    title,
    category,
    cost,
    date,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Only Registered Users Can Create Items', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  // Could console log the user and/or created item here

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdItem.save({ session: sess });
    user.items.push(createdItem);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating Item failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ item: createdItem });
};

const updateItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, category, cost, date } = req.body;
  const itemId = req.params.catId;

  let item;
  try {
    item = await Item.findById(itemId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update item.',
      500
    );
    return next(error);
  }

  item.title = title;
  item.category = category;
  item.cost = cost;
  item.date = date;

  try {
    await item.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update item.',
      500
    );
    return next(error);
  }

  res.status(200).json({ item: item.toObject({ getters: true }) });
};

const deleteItem = async (req, res, next) => {
  const itemId = req.params.catId;

  let item;
  try {
    item = await Item.findById(itemId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete item. Populate Failed',
      500
    );
    return next(error);
  }

  if (!item) {
    const error = new HttpError('Could not find an item for this id.', 404);
    return next(error);
  }

  console.log(item);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await item.deleteOne({ session: sess });
    item.creator.items.pull(item);
    await item.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete item. Mongoose start session failed',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Deleted Item.' });
};

exports.getAllItems = getAllItems;
exports.getItemById = getItemById;
exports.getItemsByUserId = getItemsByUserId;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
