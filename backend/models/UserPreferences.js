const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPreferences = sequelize.define('UserPreferences', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark', 'auto'),
      defaultValue: 'light'
    },
    fontSize: {
      type: DataTypes.INTEGER,
      defaultValue: 16,
      validate: {
        min: 12,
        max: 32
      }
    },
    fontFamily: {
      type: DataTypes.STRING(50),
      defaultValue: 'Arial'
    },
    lineHeight: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 1.5,
      validate: {
        min: 1.0,
        max: 3.0
      }
    },
    pageWidth: {
      type: DataTypes.INTEGER,
      defaultValue: 800,
      validate: {
        min: 400,
        max: 1200
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true
  });

  return UserPreferences;
};