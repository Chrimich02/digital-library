const db = require('../models');

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
const getPreferences = async (req, res) => {
  try {
    let preferences = await db.UserPreferences.findOne({
      where: { userId: req.user.id }
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await db.UserPreferences.create({
        userId: req.user.id
      });
    }

    res.json({
      success: true,
      data: { preferences }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    let preferences = await db.UserPreferences.findOne({
      where: { userId: req.user.id }
    });

    if (!preferences) {
      preferences = await db.UserPreferences.create({
        userId: req.user.id
      });
    }

    const { theme, fontSize, fontFamily, lineHeight, pageWidth } = req.body;

    // Update fields
    if (theme !== undefined) preferences.theme = theme;
    if (fontSize !== undefined) preferences.fontSize = fontSize;
    if (fontFamily !== undefined) preferences.fontFamily = fontFamily;
    if (lineHeight !== undefined) preferences.lineHeight = lineHeight;
    if (pageWidth !== undefined) preferences.pageWidth = pageWidth;

    await preferences.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

module.exports = {
  getPreferences,
  updatePreferences
};