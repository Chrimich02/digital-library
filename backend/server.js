const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve test page
app.use(express.static(path.join(__dirname, 'public')));

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
};

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/annotations', require('./routes/annotationRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/preferences', require('./routes/preferencesRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes')); // 👈 ΝΕΟ!

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    environment: process.env.NODE_ENV,
    database: db.sequelize.options.database
  });
});

// Error handler middleware (πρέπει να είναι τελευταίο)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log('=================================');
  
  // Test database connection on startup
  await testDatabaseConnection();
  
  console.log('📚 Available routes:');
  console.log('');
  console.log('   🔐 AUTH:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/me');
  console.log('   PUT    /api/auth/profile');
  console.log('');
  console.log('   📖 BOOKS:');
  console.log('   GET    /api/books');
  console.log('   POST   /api/books');
  console.log('   GET    /api/books/:id');
  console.log('   PUT    /api/books/:id');
  console.log('   DELETE /api/books/:id');
  console.log('   PUT    /api/books/:id/cover');
  console.log('   GET    /api/books/:id/download');
  console.log('');
  console.log('   📂 CATEGORIES:');
  console.log('   GET    /api/categories');
  console.log('   POST   /api/categories');
  console.log('   GET    /api/categories/:id');
  console.log('   PUT    /api/categories/:id');
  console.log('   DELETE /api/categories/:id');
  console.log('');
  console.log('   🏷️  TAGS:');
  console.log('   GET    /api/tags');
  console.log('   POST   /api/tags');
  console.log('   POST   /api/tags/bulk');
  console.log('   GET    /api/tags/:id');
  console.log('   PUT    /api/tags/:id');
  console.log('   DELETE /api/tags/:id');
  console.log('');
  console.log('   ✏️  ANNOTATIONS:');
  console.log('   GET    /api/annotations');
  console.log('   POST   /api/annotations');
  console.log('   GET    /api/annotations/book/:bookId');
  console.log('   DELETE /api/annotations/book/:bookId');
  console.log('   GET    /api/annotations/:id');
  console.log('   PUT    /api/annotations/:id');
  console.log('   DELETE /api/annotations/:id');
  console.log('');
  console.log('   📊 PROGRESS:');
  console.log('   GET    /api/progress');
  console.log('   GET    /api/progress/:bookId');
  console.log('   PUT    /api/progress/:bookId');
  console.log('   PUT    /api/progress/:bookId/complete');
  console.log('   DELETE /api/progress/:bookId');
  console.log('');
  console.log('   🔍 SEARCH:');
  console.log('   GET    /api/search');
  console.log('   GET    /api/search/suggestions');
  console.log('   GET    /api/search/stats');
  console.log('');
  console.log('   ⚙️  PREFERENCES:');
  console.log('   GET    /api/preferences');
  console.log('   PUT    /api/preferences');
  console.log('');
  console.log('   💡 RECOMMENDATIONS:'); // 👈 ΝΕΟ!
  console.log('   GET    /api/recommendations');
  console.log('=================================');
});