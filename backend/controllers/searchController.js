const db = require('../models');
const { Op } = require('sequelize');

// @desc    Advanced search for books
// @route   GET /api/search
// @access  Private
const searchBooks = async (req, res) => {
  try {
    const {
      q,              // General search query
      title,          // Search by title
      author,         // Search by author
      categoryId,     // Filter by category
      tagId,          // Filter by tag
      fileType,       // Filter by file type
      language,       // Filter by language
      minPages,       // Minimum page count
      maxPages,       // Maximum page count
      status,         // reading status (completed, reading, unstarted)
      sortBy = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };
    const include = [];

    // General search (searches in title, author, description)
    if (q) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${q}%` } },
        { author: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } }
      ];
    }

    // Specific field searches
    if (title) {
      where.title = { [Op.iLike]: `%${title}%` };
    }

    if (author) {
      where.author = { [Op.iLike]: `%${author}%` };
    }

    if (fileType) {
      where.fileType = fileType;
    }

    if (language) {
      where.language = language;
    }

    // Page count filters
    if (minPages) {
      where.pageCount = { ...where.pageCount, [Op.gte]: parseInt(minPages) };
    }

    if (maxPages) {
      where.pageCount = { ...where.pageCount, [Op.lte]: parseInt(maxPages) };
    }

    // Category filter
    if (categoryId) {
      include.push({
        model: db.Category,
        as: 'categories',
        where: { id: categoryId },
        through: { attributes: [] }
      });
    } else {
      include.push({
        model: db.Category,
        as: 'categories',
        through: { attributes: [] }
      });
    }

    // Tag filter
    if (tagId) {
      include.push({
        model: db.Tag,
        as: 'tags',
        where: { id: tagId },
        through: { attributes: [] }
      });
    } else {
      include.push({
        model: db.Tag,
        as: 'tags',
        through: { attributes: [] }
      });
    }

    // Reading progress
    const progressInclude = {
      model: db.ReadingProgress,
      as: 'progress'
    };

    // Status filter
    if (status === 'completed') {
      progressInclude.where = { isCompleted: true };
      progressInclude.required = true;
    } else if (status === 'reading') {
      progressInclude.where = {
        isCompleted: false,
        percentage: { [Op.gt]: 0 }
      };
      progressInclude.required = true;
    } else if (status === 'unstarted') {
      progressInclude.where = {
        [Op.or]: [
          { percentage: 0 },
          { percentage: null }
        ]
      };
      progressInclude.required = false;
    }

    include.push(progressInclude);

    // Execute query
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
        },
        filters: {
          query: q,
          title,
          author,
          categoryId,
          tagId,
          fileType,
          language,
          minPages,
          maxPages,
          status
        }
      }
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching books',
      error: error.message
    });
  }
};

// @desc    Get search suggestions (autocomplete)
// @route   GET /api/search/suggestions
// @access  Private
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          titles: [],
          authors: [],
          categories: [],
          tags: []
        }
      });
    }

    const suggestions = {};

    // Book titles
    if (type === 'all' || type === 'titles') {
      const titles = await db.Book.findAll({
        where: {
          userId: req.user.id,
          title: { [Op.iLike]: `%${q}%` }
        },
        attributes: ['id', 'title'],
        limit: 5
      });
      suggestions.titles = titles.map(b => ({ id: b.id, value: b.title }));
    }

    // Authors
    if (type === 'all' || type === 'authors') {
      const authors = await db.Book.findAll({
        where: {
          userId: req.user.id,
          author: { [Op.iLike]: `%${q}%`, [Op.ne]: null }
        },
        attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('author')), 'author']],
        limit: 5,
        raw: true
      });
      suggestions.authors = authors.map(a => ({ value: a.author }));
    }

    // Categories
    if (type === 'all' || type === 'categories') {
      const categories = await db.Category.findAll({
        where: {
          userId: req.user.id,
          name: { [Op.iLike]: `%${q}%` }
        },
        attributes: ['id', 'name', 'color'],
        limit: 5
      });
      suggestions.categories = categories.map(c => ({
        id: c.id,
        value: c.name,
        color: c.color
      }));
    }

    // Tags
    if (type === 'all' || type === 'tags') {
      const tags = await db.Tag.findAll({
        where: {
          userId: req.user.id,
          name: { [Op.iLike]: `%${q}%` }
        },
        attributes: ['id', 'name'],
        limit: 5
      });
      suggestions.tags = tags.map(t => ({ id: t.id, value: t.name }));
    }

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions',
      error: error.message
    });
  }
};

// @desc    Get library statistics
// @route   GET /api/search/stats
// @access  Private
const getLibraryStats = async (req, res) => {
  try {
    // Total books
    const totalBooks = await db.Book.count({
      where: { userId: req.user.id }
    });

    // Books by file type
    const booksByType = await db.Book.findAll({
      where: { userId: req.user.id },
      attributes: [
        'fileType',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['fileType'],
      raw: true
    });

    // Books by language
    const booksByLanguage = await db.Book.findAll({
      where: { userId: req.user.id },
      attributes: [
        'language',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['language'],
      raw: true
    });

    // Reading statistics
    const readingStats = await db.ReadingProgress.findAll({
      where: { userId: req.user.id },
      attributes: [
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN "isCompleted" = true THEN 1 END')), 'completed'],
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN "isCompleted" = false AND "percentage" > 0 THEN 1 END')), 'reading'],
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN "percentage" = 0 THEN 1 END')), 'unstarted'],
        [db.Sequelize.fn('AVG', db.Sequelize.col('percentage')), 'avgProgress']
      ],
      raw: true
    });

    // Total pages read (approximate)
    const totalPagesRead = await db.ReadingProgress.sum('currentPage', {
      where: { userId: req.user.id }
    });

    // Categories count
    const categoriesCount = await db.Category.count({
      where: { userId: req.user.id }
    });

    // Tags count
    const tagsCount = await db.Tag.count({
      where: { userId: req.user.id }
    });

    // Annotations count
    const annotationsCount = await db.Annotation.count({
      where: { userId: req.user.id }
    });

    const annotationsByType = await db.Annotation.findAll({
      where: { userId: req.user.id },
      attributes: [
        'type',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    // Recently added books
    const recentBooks = await db.Book.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'author', 'coverImage', 'createdAt']
    });

    // Currently reading
    const currentlyReading = await db.Book.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: db.ReadingProgress,
          as: 'progress',
          where: {
            isCompleted: false,
            percentage: { [Op.gt]: 0 }
          }
        }
      ],
      order: [[{ model: db.ReadingProgress, as: 'progress' }, 'lastReadAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBooks,
          totalPagesRead: totalPagesRead || 0,
          categoriesCount,
          tagsCount,
          annotationsCount
        },
        reading: {
          completed: parseInt(readingStats[0]?.completed || 0),
          reading: parseInt(readingStats[0]?.reading || 0),
          unstarted: parseInt(readingStats[0]?.unstarted || 0),
          avgProgress: parseFloat(readingStats[0]?.avgProgress || 0).toFixed(2)
        },
        booksByType,
        booksByLanguage,
        annotationsByType,
        recentBooks,
        currentlyReading
      }
    });
  } catch (error) {
    console.error('Get library stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library statistics',
      error: error.message
    });
  }
};

module.exports = {
  searchBooks,
  getSearchSuggestions,
  getLibraryStats
};