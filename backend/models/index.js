const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Δημιουργία σύνδεσης με τη βάση
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

// Import όλων των models
db.User = require('./User')(sequelize);
db.Book = require('./Book')(sequelize);
db.Category = require('./Category')(sequelize);
db.Tag = require('./Tag')(sequelize);
db.Annotation = require('./Annotation')(sequelize);
db.ReadingProgress = require('./ReadingProgress')(sequelize);
db.UserPreferences = require('./UserPreferences')(sequelize);

// ===== ASSOCIATIONS (Σχέσεις μεταξύ πινάκων) =====

// User associations
db.User.hasMany(db.Book, { foreignKey: 'userId', as: 'books' });
db.User.hasMany(db.Category, { foreignKey: 'userId', as: 'categories' });
db.User.hasMany(db.Tag, { foreignKey: 'userId', as: 'tags' });
db.User.hasMany(db.Annotation, { foreignKey: 'userId', as: 'annotations' });
db.User.hasOne(db.UserPreferences, { foreignKey: 'userId', as: 'preferences' });

// Book associations
db.Book.belongsTo(db.User, { foreignKey: 'userId', as: 'owner' });
db.Book.belongsToMany(db.Category, { 
  through: 'book_categories', 
  foreignKey: 'bookId',
  otherKey: 'categoryId',
  as: 'categories' 
});
db.Book.belongsToMany(db.Tag, { 
  through: 'book_tags', 
  foreignKey: 'bookId',
  otherKey: 'tagId',
  as: 'tags' 
});
db.Book.hasMany(db.Annotation, { foreignKey: 'bookId', as: 'annotations' });
db.Book.hasOne(db.ReadingProgress, { foreignKey: 'bookId', as: 'progress' });

// Category associations
db.Category.belongsTo(db.User, { foreignKey: 'userId', as: 'owner' });
db.Category.belongsToMany(db.Book, { 
  through: 'book_categories', 
  foreignKey: 'categoryId',
  otherKey: 'bookId',
  as: 'books' 
});

// Tag associations
db.Tag.belongsTo(db.User, { foreignKey: 'userId', as: 'owner' });
db.Tag.belongsToMany(db.Book, { 
  through: 'book_tags', 
  foreignKey: 'tagId',
  otherKey: 'bookId',
  as: 'books' 
});

// Annotation associations
db.Annotation.belongsTo(db.Book, { foreignKey: 'bookId', as: 'book' });
db.Annotation.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// ReadingProgress associations
db.ReadingProgress.belongsTo(db.Book, { foreignKey: 'bookId', as: 'book' });
db.ReadingProgress.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// UserPreferences associations
db.UserPreferences.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;