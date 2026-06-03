const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['want', 'reading', 'done', 'paused'],
    default: 'want',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  memo: {
    type: String,
    default: '',
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Book', bookSchema);
