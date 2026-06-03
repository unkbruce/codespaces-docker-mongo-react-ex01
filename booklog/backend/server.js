require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklog';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'BookLog API가 실행 중입니다.' });
});

app.use('/books', booksRouter);

const startServer = async () => {
  try {
    // 서버가 시작되기 전에 MongoDB 연결을 먼저 완료합니다.
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`BookLog API server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
