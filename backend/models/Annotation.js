const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Annotation = sequelize.define('Annotation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('highlight', 'note', 'bookmark'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    highlightedText: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#fef08a'
    },
    pageNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    position: {
      type: DataTypes.JSON,
      allowNull: true
    },
    positions: {  // ✨ ΝΕΟ
      type: DataTypes.JSON,
      allowNull: true
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
    tableName: 'annotations',
    timestamps: true
  });

  return Annotation;
};