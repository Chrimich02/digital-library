const db = require('../models');

// @desc    Create new annotation
// @route   POST /api/annotations
// @access  Private
const createAnnotation = async (req, res) => {
  try {
    const {
      bookId,
      type,
      content,
      highlightedText,
      color,
      pageNumber,
      position,
      positions  //  ΠΡΟΣΘΗΚΗ: Υποστήριξη για positions array
    } = req.body;

    // Validation
    if (!bookId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and annotation type are required'
      });
    }

    // Έλεγχος τύπου
    if (!['highlight', 'note', 'bookmark'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid annotation type. Must be: highlight, note, or bookmark'
      });
    }

    // Έλεγχος ότι το βιβλίο ανήκει στον χρήστη
    const book = await db.Book.findOne({
      where: {
        id: bookId,
        userId: req.user.id
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or does not belong to you'
      });
    }

    // Δημιουργία annotation
    const annotation = await db.Annotation.create({
      bookId,
      userId: req.user.id,
      type,
      content,
      highlightedText,
      color: color || '#fef08a',
      pageNumber,
      position,
      positions  // ✨ ΠΡΟΣΘΗΚΗ: Αποθήκευση του positions array
    });

    res.status(201).json({
      success: true,
      message: 'Annotation created successfully',
      data: { annotation }
    });
  } catch (error) {
    console.error('Create annotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating annotation',
      error: error.message
    });
  }
};

// @desc    Get all annotations for a book
// @route   GET /api/annotations/book/:bookId
// @access  Private
const getBookAnnotations = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { type } = req.query;

    // Έλεγχος ότι το βιβλίο ανήκει στον χρήστη
    const book = await db.Book.findOne({
      where: {
        id: bookId,
        userId: req.user.id
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Build where clause
    const where = {
      bookId,
      userId: req.user.id
    };

    if (type) {
      where.type = type;
    }

    const annotations = await db.Annotation.findAll({
      where,
      order: [['pageNumber', 'ASC'], ['createdAt', 'ASC']]
    });

    // Group by type
    const grouped = {
      highlights: annotations.filter(a => a.type === 'highlight'),
      notes: annotations.filter(a => a.type === 'note'),
      bookmarks: annotations.filter(a => a.type === 'bookmark')
    };

    res.json({
      success: true,
      data: {
        annotations,
        grouped,
        total: annotations.length
      }
    });
  } catch (error) {
    console.error('Get book annotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching annotations',
      error: error.message
    });
  }
};

// @desc    Get all user's annotations
// @route   GET /api/annotations
// @access  Private
const getAllAnnotations = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = { userId: req.user.id };
    if (type) {
      where.type = type;
    }

    const { count, rows } = await db.Annotation.findAndCountAll({
      where,
      include: [
        {
          model: db.Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'coverImage']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        annotations: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all annotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching annotations',
      error: error.message
    });
  }
};

// @desc    Get single annotation
// @route   GET /api/annotations/:id
// @access  Private
const getAnnotation = async (req, res) => {
  try {
    const annotation = await db.Annotation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: db.Book,
          as: 'book',
          attributes: ['id', 'title', 'author']
        }
      ]
    });

    if (!annotation) {
      return res.status(404).json({
        success: false,
        message: 'Annotation not found'
      });
    }

    res.json({
      success: true,
      data: { annotation }
    });
  } catch (error) {
    console.error('Get annotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching annotation',
      error: error.message
    });
  }
};

// @desc    Update annotation
// @route   PUT /api/annotations/:id
// @access  Private
const updateAnnotation = async (req, res) => {
  try {
    const annotation = await db.Annotation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!annotation) {
      return res.status(404).json({
        success: false,
        message: 'Annotation not found'
      });
    }

    const { content, highlightedText, color, pageNumber, position, positions } = req.body;

    // Update fields
    if (content !== undefined) annotation.content = content;
    if (highlightedText !== undefined) annotation.highlightedText = highlightedText;
    if (color !== undefined) annotation.color = color;
    if (pageNumber !== undefined) annotation.pageNumber = pageNumber;
    if (position !== undefined) annotation.position = position;
    if (positions !== undefined) annotation.positions = positions;  // ✨ ΠΡΟΣΘΗΚΗ

    await annotation.save();

    res.json({
      success: true,
      message: 'Annotation updated successfully',
      data: { annotation }
    });
  } catch (error) {
    console.error('Update annotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating annotation',
      error: error.message
    });
  }
};

// @desc    Delete annotation
// @route   DELETE /api/annotations/:id
// @access  Private
const deleteAnnotation = async (req, res) => {
  try {
    const annotation = await db.Annotation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!annotation) {
      return res.status(404).json({
        success: false,
        message: 'Annotation not found'
      });
    }

    await annotation.destroy();

    res.json({
      success: true,
      message: 'Annotation deleted successfully'
    });
  } catch (error) {
    console.error('Delete annotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting annotation',
      error: error.message
    });
  }
};

// @desc    Delete all annotations for a book
// @route   DELETE /api/annotations/book/:bookId
// @access  Private
const deleteBookAnnotations = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { type } = req.query;

    // Έλεγχος ότι το βιβλίο ανήκει στον χρήστη
    const book = await db.Book.findOne({
      where: {
        id: bookId,
        userId: req.user.id
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const where = {
      bookId,
      userId: req.user.id
    };

    if (type) {
      where.type = type;
    }

    const deletedCount = await db.Annotation.destroy({ where });

    res.json({
      success: true,
      message: `Deleted ${deletedCount} annotation(s)`,
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Delete book annotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting annotations',
      error: error.message
    });
  }
};

module.exports = {
  createAnnotation,
  getBookAnnotations,
  getAllAnnotations,
  getAnnotation,
  updateAnnotation,
  deleteAnnotation,
  deleteBookAnnotations
};