const express = require('express');
const router = express.Router();
const {
  updateProgress,
  getProgress,
  getAllProgress,
  markAsCompleted,
  resetProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// Όλα τα routes χρειάζονται authentication
router.use(protect);

router.get('/', getAllProgress);
router.get('/:bookId', getProgress);
router.put('/:bookId', updateProgress);
router.put('/:bookId/complete', markAsCompleted);
router.delete('/:bookId', resetProgress);

module.exports = router;