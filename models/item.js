const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const itemSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    cost: { type: Number, required: true },
    date: { type: String, required: true },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'}
});

module.exports = mongoose.model('Item', itemSchema);