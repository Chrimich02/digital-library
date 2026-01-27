const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReadingProgress = sequelize.define('ReadingProgress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    currentPage: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    totalPages: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 100
      }
    },
    lastReadAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'reading_progress',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['bookId', 'userId']
      }
    ]
  });

  return ReadingProgress;
};