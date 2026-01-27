const express = require('express');
const router = express.Router();
const {
  uploadBook,
  getBooks,
  getBook,
  updateBook,
  uploadBookCover,
  deleteBook,
  downloadBook,
  viewBook  // 👈 ΠΡΟΣΘΗΚΗ
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const { uploadBook: uploadBookMiddleware, uploadCover, uploadBookWithCover } = require('../config/multer');

// Όλα τα routes χρειάζονται authentication
router.use(protect);

// Books routes
router.route('/')
  .get(getBooks)
  .post(uploadBookWithCover.fields([
    { name: 'book', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]), uploadBook);

router.route('/:id')
  .get(getBook)
  .put(updateBook)
  .delete(deleteBook);

router.put('/:id/cover', uploadCover.single('cover'), uploadBookCover);
router.get('/:id/download', downloadBook);
router.get('/:id/view', viewBook);  

module.exports = router;