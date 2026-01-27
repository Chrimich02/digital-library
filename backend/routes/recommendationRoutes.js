const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  searchBooks
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getRecommendations);
router.get('/search', searchBooks);

module.exports = router;