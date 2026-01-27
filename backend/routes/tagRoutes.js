const express = require('express');
const router = express.Router();
const {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag,
  createBulkTags
} = require('../controllers/tagController');
const { protect } = require('../middleware/auth');

// Όλα τα routes χρειάζονται authentication
router.use(protect);

router.route('/')
  .get(getTags)
  .post(createTag);

router.post('/bulk', createBulkTags);

router.route('/:id')
  .get(getTag)
  .put(updateTag)
  .delete(deleteTag);

module.exports = router;