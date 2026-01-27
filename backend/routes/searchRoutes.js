const express = require('express');
const router = express.Router();
const {
  searchBooks,
  getSearchSuggestions,
  getLibraryStats
} = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

// Όλα τα routes χρειάζονται authentication
router.use(protect);

router.get('/', searchBooks);
router.get('/suggestions', getSearchSuggestions);
router.get('/stats', getLibraryStats);

module.exports = router;