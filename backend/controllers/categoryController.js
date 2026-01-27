const db = require('../models');

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Έλεγχος αν υπάρχει ήδη
    const existingCategory = await db.Category.findOne({
      where: {
        name,
        userId: req.user.id
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Δημιουργία κατηγορίας
    const category = await db.Category.create({
      name,
      description,
      color: color || '#6366f1',
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// @desc    Get all user's categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: db.Book,
          as: 'books',
          attributes: ['id', 'title', 'coverImage'],
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']]
    });

    // Προσθήκη book count
    const categoriesWithCount = categories.map(cat => ({
      ...cat.toJSON(),
      bookCount: cat.books.length
    }));

    res.json({
      success: true,
      data: {
        categories: categoriesWithCount,
        total: categories.length
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res) => {
  try {
    const category = await db.Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: db.Book,
          as: 'books',
          through: { attributes: [] },
          include: [
            { model: db.ReadingProgress, as: 'progress' }
          ]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const category = await db.Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { name, description, color } = req.body;

    // Έλεγχος για duplicate name
    if (name && name !== category.name) {
      const existingCategory = await db.Category.findOne({
        where: {
          name,
          userId: req.user.id,
          id: { [db.Sequelize.Op.ne]: req.params.id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await db.Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
};