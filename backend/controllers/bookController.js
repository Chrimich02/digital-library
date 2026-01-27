const db = require('../models');
const fs = require('fs');
const path = require('path');

// @desc    Upload new book
// @route   POST /api/books
// @access  Private
const uploadBook = async (req, res) => {
  try {
    // Έλεγχος αν υπάρχει το αρχείο βιβλίου
    if (!req.files || !req.files.book || !req.files.book[0]) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a book file'
      });
    }

    const bookFile = req.files.book[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    const {
      title,
      author,
      description,
      isbn,
      publisher,
      publishedDate,
      language,
      pageCount,
      categoryIds,
      tagIds
    } = req.body;

    // Validation
    if (!title) {
      // Διαγραφή των uploaded αρχείων αν δεν υπάρχει τίτλος
      fs.unlinkSync(bookFile.path);
      if (coverFile) fs.unlinkSync(coverFile.path);
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Προσδιορισμός τύπου αρχείου
    const fileType = path.extname(bookFile.originalname).toLowerCase().substring(1);

    // Δημιουργία βιβλίου
    const book = await db.Book.create({
      title,
      author,
      description,
      isbn,
      publisher,
      publishedDate,
      language: language || 'el',
      pageCount: pageCount ? parseInt(pageCount) : null,
      fileType,
      filePath: bookFile.path,
      fileSize: bookFile.size,
      coverImage: coverFile ? coverFile.path : null,
      userId: req.user.id
    });

    // Προσθήκη κατηγοριών αν υπάρχουν
    if (categoryIds) {
      const categories = JSON.parse(categoryIds);
      if (categories.length > 0) {
        await book.addCategories(categories);
      }
    }

    // Προσθήκη tags αν υπάρχουν
    if (tagIds) {
      const tags = JSON.parse(tagIds);
      if (tags.length > 0) {
        await book.addTags(tags);
      }
    }

    // Δημιουργία reading progress
    await db.ReadingProgress.create({
      bookId: book.id,
      userId: req.user.id,
      currentPage: 1,
      totalPages: pageCount ? parseInt(pageCount) : null,
      percentage: 0
    });

    // Φόρτωση του βιβλίου με τις σχέσεις
    const bookWithRelations = await db.Book.findByPk(book.id, {
      include: [
        { model: db.Category, as: 'categories' },
        { model: db.Tag, as: 'tags' },
        { model: db.ReadingProgress, as: 'progress' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Book uploaded successfully',
      data: { book: bookWithRelations }
    });
  } catch (error) {
    // Διαγραφή των uploaded αρχείων σε περίπτωση σφάλματος
    if (req.files) {
      if (req.files.book && req.files.book[0]) {
        fs.unlinkSync(req.files.book[0].path);
      }
      if (req.files.cover && req.files.cover[0]) {
        fs.unlinkSync(req.files.cover[0].path);
      }
    }
    console.error('Upload book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading book',
      error: error.message
    });
  }
};

// @desc    Get all user's books
// @route   GET /api/books
// @access  Private
const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      tagId,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = { userId: req.user.id };

    // Search filter
    if (search) {
      where[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { author: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { description: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    // Build include array
    const include = [
      { model: db.Category, as: 'categories' },
      { model: db.Tag, as: 'tags' },
      { model: db.ReadingProgress, as: 'progress' }
    ];

    // Category filter
    if (categoryId) {
      include[0].where = { id: categoryId };
      include[0].required = true;
    }

    // Tag filter
    if (tagId) {
      include[1].where = { id: tagId };
      include[1].required = true;
    }

    const { count, rows } = await db.Book.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      distinct: true
    });

    res.json({
      success: true,
      data: {
        books: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private
const getBook = async (req, res) => {
  try {
    const book = await db.Book.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        { model: db.Category, as: 'categories' },
        { model: db.Tag, as: 'tags' },
        { model: db.ReadingProgress, as: 'progress' },
        { 
          model: db.Annotation, 
          as: 'annotations',
          order: [['pageNumber', 'ASC']]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: { book }
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const book = await db.Book.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const {
      title,
      author,
      description,
      isbn,
      publisher,
      publishedDate,
      language,
      pageCount,
      categoryIds,
      tagIds
    } = req.body;

    // Update fields
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (description !== undefined) book.description = description;
    if (isbn !== undefined) book.isbn = isbn;
    if (publisher !== undefined) book.publisher = publisher;
    if (publishedDate !== undefined) book.publishedDate = publishedDate;
    if (language !== undefined) book.language = language;
    if (pageCount !== undefined) book.pageCount = pageCount;

    await book.save();

    // Update categories
    if (categoryIds !== undefined) {
      const categories = JSON.parse(categoryIds);
      await book.setCategories(categories);
    }

    // Update tags
    if (tagIds !== undefined) {
      const tags = JSON.parse(tagIds);
      await book.setTags(tags);
    }

    // Reload with relations
    const updatedBook = await db.Book.findByPk(book.id, {
      include: [
        { model: db.Category, as: 'categories' },
        { model: db.Tag, as: 'tags' },
        { model: db.ReadingProgress, as: 'progress' }
      ]
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book: updatedBook }
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

// @desc    Upload book cover
// @route   PUT /api/books/:id/cover
// @access  Private
const uploadBookCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const book = await db.Book.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!book) {
      // Διαγραφή uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Διαγραφή παλιού cover αν υπάρχει
    if (book.coverImage && fs.existsSync(book.coverImage)) {
      fs.unlinkSync(book.coverImage);
    }

    // Update cover path
    book.coverImage = req.file.path;
    await book.save();

    res.json({
      success: true,
      message: 'Book cover uploaded successfully',
      data: { 
        coverImage: book.coverImage 
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload cover error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading cover',
      error: error.message
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await db.Book.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Διαγραφή του αρχείου βιβλίου
    if (fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }

    // Διαγραφή του cover αν υπάρχει
    if (book.coverImage && fs.existsSync(book.coverImage)) {
      fs.unlinkSync(book.coverImage);
    }

    // Διαγραφή από τη βάση (cascade θα διαγράψει και τις σχέσεις)
    await book.destroy();

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

// @desc    Download book file
// @route   GET /api/books/:id/download
// @access  Private
const downloadBook = async (req, res) => {
  try {
    const book = await db.Book.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!fs.existsSync(book.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Book file not found'
      });
    }

    // Sanitize filename - αφαίρεση ειδικών χαρακτήρων και ελληνικών
    const sanitizedTitle = book.title
      .replace(/[^\w\s-]/g, '') // Αφαίρεση ειδικών χαρακτήρων
      .replace(/\s+/g, '_')      // Αντικατάσταση spaces με underscore
      .substring(0, 100);        // Περιορισμός μήκους

    // Set headers για download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.${book.fileType}"`);
    
    // Stream το αρχείο
    const fileStream = fs.createReadStream(book.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading book',
      error: error.message
    });
  }
};

// @desc    View book file (for reading in browser)
// @route   GET /api/books/:id/view
// @access  Private
const viewBook = async (req, res) => {
  try {
    const book = await db.Book.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!fs.existsSync(book.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Book file not found'
      });
    }

    // Καθορισμός Content-Type ανάλογα με τον τύπο αρχείου
    let contentType = 'application/octet-stream';
    if (book.fileType === 'pdf') {
      contentType = 'application/pdf';
    } else if (book.fileType === 'epub') {
      contentType = 'application/epub+zip';
    }

    // Sanitize filename - αφαίρεση ειδικών χαρακτήρων και ελληνικών
    const sanitizedTitle = book.title
      .replace(/[^\w\s-]/g, '') // Αφαίρεση ειδικών χαρακτήρων
      .replace(/\s+/g, '_')      // Αντικατάσταση spaces με underscore
      .substring(0, 100);        // Περιορισμός μήκους

    // Set headers για inline viewing (όχι download)
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedTitle}.${book.fileType}"`);
    
    // Stream το αρχείο
    const fileStream = fs.createReadStream(book.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('View book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error viewing book',
      error: error.message
    });
  }
};

module.exports = {
  uploadBook,
  getBooks,
  getBook,
  updateBook,
  uploadBookCover,
  deleteBook,
  downloadBook,
  viewBook
};