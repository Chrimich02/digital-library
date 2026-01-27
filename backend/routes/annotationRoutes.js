const express = require('express');
const router = express.Router();
const {
  createAnnotation,
  getBookAnnotations,
  getAllAnnotations,
  getAnnotation,
  updateAnnotation,
  deleteAnnotation,
  deleteBookAnnotations
} = require('../controllers/annotationController');
const { protect } = require('../middleware/auth');

// Όλα τα routes χρειάζονται authentication
router.use(protect);

router.route('/')
  .get(getAllAnnotations)
  .post(createAnnotation);

router.get('/book/:bookId', getBookAnnotations);
router.delete('/book/:bookId', deleteBookAnnotations);

router.route('/:id')
  .get(getAnnotation)
  .put(updateAnnotation)
  .delete(deleteAnnotation);

module.exports = router;