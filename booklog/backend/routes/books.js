const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');

const router = express.Router();
const STATUS_VALUES = ['want', 'reading', 'done', 'paused'];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildBookFilter = ({ q, status, category }) => {
  const filter = {};

  // q가 들어오면 제목 또는 저자에 해당 글자가 포함된 책을 찾습니다.
  if (q && q.trim()) {
    const keyword = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: keyword }, { author: keyword }];
  }

  if (status && STATUS_VALUES.includes(status)) {
    filter.status = status;
  }

  if (category && category.trim()) {
    filter.category = category.trim();
  }

  return filter;
};

router.get('/', async (req, res) => {
  try {
    const filter = buildBookFilter(req.query);
    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: '책 목록을 불러오지 못했습니다.', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '올바르지 않은 책 ID입니다.' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '책을 찾을 수 없습니다.' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: '책 상세 정보를 불러오지 못했습니다.', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: '책을 추가하지 못했습니다.', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '올바르지 않은 책 ID입니다.' });
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ message: '책을 찾을 수 없습니다.' });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: '책을 수정하지 못했습니다.', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '올바르지 않은 책 ID입니다.' });
    }

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: '책을 찾을 수 없습니다.' });
    }

    res.json({ message: '책이 삭제되었습니다.', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: '책을 삭제하지 못했습니다.', error: error.message });
  }
});

module.exports = router;
