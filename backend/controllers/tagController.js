const db = require('../models');

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private
const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    // Έλεγχος αν υπάρχει ήδη
    const existingTag = await db.Tag.findOne({
      where: {
        name,
        userId: req.user.id
      }
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    // Δημιουργία tag
    const tag = await db.Tag.create({
      name,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: { tag }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tag',
      error: error.message
    });
  }
};

// @desc    Get all user's tags
// @route   GET /api/tags
// @access  Private
const getTags = async (req, res) => {
  try {
    const tags = await db.Tag.findAll({
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
    const tagsWithCount = tags.map(tag => ({
      ...tag.toJSON(),
      bookCount: tag.books.length
    }));

    res.json({
      success: true,
      data: {
        tags: tagsWithCount,
        total: tags.length
      }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Private
const getTag = async (req, res) => {
  try {
    const tag = await db.Tag.findOne({
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

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: { tag }
    });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tag',
      error: error.message
    });
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private
const updateTag = async (req, res) => {
  try {
    const tag = await db.Tag.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    const { name } = req.body;

    // Έλεγχος για duplicate name
    if (name && name !== tag.name) {
      const existingTag = await db.Tag.findOne({
        where: {
          name,
          userId: req.user.id,
          id: { [db.Sequelize.Op.ne]: req.params.id }
        }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Tag with this name already exists'
        });
      }
    }

    // Update field
    if (name !== undefined) tag.name = name;

    await tag.save();

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: { tag }
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tag',
      error: error.message
    });
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private
const deleteTag = async (req, res) => {
  try {
    const tag = await db.Tag.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    await tag.destroy();

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tag',
      error: error.message
    });
  }
};

// @desc    Create multiple tags at once
// @route   POST /api/tags/bulk
// @access  Private
const createBulkTags = async (req, res) => {
  try {
    const { tags } = req.body; // Array of tag names

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of tag names'
      });
    }

    const createdTags = [];
    const errors = [];

    for (const tagName of tags) {
      try {
        // Έλεγχος αν υπάρχει ήδη
        const existingTag = await db.Tag.findOne({
          where: {
            name: tagName,
            userId: req.user.id
          }
        });

        if (existingTag) {
          createdTags.push(existingTag);
        } else {
          const newTag = await db.Tag.create({
            name: tagName,
            userId: req.user.id
          });
          createdTags.push(newTag);
        }
      } catch (error) {
        errors.push({ tag: tagName, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created/found ${createdTags.length} tags`,
      data: { 
        tags: createdTags,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Create bulk tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tags',
      error: error.message
    });
  }
};

module.exports = {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag,
  createBulkTags
};