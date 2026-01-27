const db = require('../models');

// @desc    Update reading progress
// @route   PUT /api/progress/:bookId
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { currentPage, totalPages } = req.body;

    // Validation
    if (!currentPage) {
      return res.status(400).json({
        success: false,
        message: 'Current page is required'
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
        message: 'Book not found'
      });
    }

    // Find or create progress
    let progress = await db.ReadingProgress.findOne({
      where: {
        bookId,
        userId: req.user.id
      }
    });

    if (!progress) {
      progress = await db.ReadingProgress.create({
        bookId,
        userId: req.user.id,
        currentPage: parseInt(currentPage),
        totalPages: totalPages ? parseInt(totalPages) : book.pageCount,
        lastReadAt: new Date()
      });
    } else {
      progress.currentPage = parseInt(currentPage);
      if (totalPages) {
        progress.totalPages = parseInt(totalPages);
      } else if (!progress.totalPages && book.pageCount) {
        progress.totalPages = book.pageCount;
      }
      progress.lastReadAt = new Date();
    }

    // Υπολογισμός ποσοστού
    if (progress.totalPages && progress.totalPages > 0) {
      progress.percentage = ((progress.currentPage / progress.totalPages) * 100).toFixed(2);
      progress.isCompleted = progress.currentPage >= progress.totalPages;
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Reading progress updated successfully',
      data: { progress }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

// @desc    Get reading progress for a book
// @route   GET /api/progress/:bookId
// @access  Private
const getProgress = async (req, res) => {
  try {
    const { bookId } = req.params;

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

    const progress = await db.ReadingProgress.findOne({
      where: {
        bookId,
        userId: req.user.id
      },
      include: [
        {
          model: db.Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'coverImage', 'pageCount']
        }
      ]
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No reading progress found for this book'
      });
    }

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Get all reading progress
// @route   GET /api/progress
// @access  Private
const getAllProgress = async (req, res) => {
  try {
    const { status, sortBy = 'lastReadAt', order = 'DESC' } = req.query;

    const where = { userId: req.user.id };

    // Filter by status
    if (status === 'completed') {
      where.isCompleted = true;
    } else if (status === 'reading') {
      where.isCompleted = false;
      where.percentage = { [db.Sequelize.Op.gt]: 0 };
    } else if (status === 'unstarted') {
      where.percentage = 0;
    }

    const progress = await db.ReadingProgress.findAll({
      where,
      include: [
        {
          model: db.Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'coverImage', 'pageCount', 'fileType']
        }
      ],
      order: [[sortBy, order]]
    });

    // Statistics
    const stats = {
      total: progress.length,
      completed: progress.filter(p => p.isCompleted).length,
      reading: progress.filter(p => !p.isCompleted && p.percentage > 0).length,
      unstarted: progress.filter(p => p.percentage == 0).length
    };

    res.json({
      success: true,
      data: {
        progress,
        stats
      }
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Mark book as completed
// @route   PUT /api/progress/:bookId/complete
// @access  Private
const markAsCompleted = async (req, res) => {
  try {
    const { bookId } = req.params;

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

    let progress = await db.ReadingProgress.findOne({
      where: {
        bookId,
        userId: req.user.id
      }
    });

    if (!progress) {
      progress = await db.ReadingProgress.create({
        bookId,
        userId: req.user.id,
        currentPage: book.pageCount || 1,
        totalPages: book.pageCount || 1,
        percentage: 100,
        isCompleted: true,
        lastReadAt: new Date()
      });
    } else {
      progress.isCompleted = true;
      progress.percentage = 100;
      progress.currentPage = progress.totalPages || book.pageCount || 1;
      progress.lastReadAt = new Date();
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Book marked as completed',
      data: { progress }
    });
  } catch (error) {
    console.error('Mark as completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking book as completed',
      error: error.message
    });
  }
};

// @desc    Reset reading progress
// @route   DELETE /api/progress/:bookId
// @access  Private
const resetProgress = async (req, res) => {
  try {
    const { bookId } = req.params;

    const progress = await db.ReadingProgress.findOne({
      where: {
        bookId,
        userId: req.user.id
      }
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No reading progress found'
      });
    }

    progress.currentPage = 1;
    progress.percentage = 0;
    progress.isCompleted = false;
    progress.lastReadAt = new Date();

    await progress.save();

    res.json({
      success: true,
      message: 'Reading progress reset successfully',
      data: { progress }
    });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting progress',
      error: error.message
    });
  }
};

module.exports = {
  updateProgress,
  getProgress,
  getAllProgress,
  markAsCompleted,
  resetProgress
};