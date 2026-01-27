const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    publisher: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    publishedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'el'
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fileType: {
      type: DataTypes.ENUM('pdf', 'epub', 'mobi', 'txt', 'doc', 'docx'),
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
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
    tableName: 'books',
    timestamps: true
  });

  return Book;
};