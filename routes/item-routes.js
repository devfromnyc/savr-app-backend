const express = require('express');
const { check } = require('express-validator');

const itemController = require('../controllers/item-controllers');

const router = express.Router();

router.get('/:catId', itemController.getItemById);

router.get('/', itemController.getAllItems);

router.get('/user/:uid', itemController.getItemsByUserId);

router.post(
  '/',
  [
    check('title')
      .not()
      .isEmpty(),
      check('category')
      .not()
      .isEmpty(),
    check('cost')
      .not()
      .isEmpty(),
    check('date')
      .not()
      .isEmpty()
  ],
  itemController.createItem
);

router.patch(
  '/:catId',
  [
    check('title')
      .not()
      .isEmpty(),
      check('category')
      .not()
      .isEmpty(),
    check('cost')
      .not()
      .isEmpty(),
    check('date')
      .not()
      .isEmpty()
  ],
  itemController.updateItem
);

router.delete('/:catId', itemController.deleteItem);

module.exports = router;