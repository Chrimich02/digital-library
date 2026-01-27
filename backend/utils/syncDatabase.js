const db = require('../models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Test connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models
    await db.sequelize.sync({ force: false, alter: true });
    console.log('✅ All models synchronized successfully!');
    
    // Εμφάνιση όλων των models που δημιουργήθηκαν
    console.log('\n📊 Created tables:');
    console.log('   - users');
    console.log('   - books');
    console.log('   - categories');
    console.log('   - tags');
    console.log('   - annotations');
    console.log('   - reading_progress');
    console.log('   - user_preferences');
    console.log('   - book_categories (junction table)');
    console.log('   - book_tags (junction table)');
    
    console.log('\n🎉 Database is ready!');
    
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

// Εκτέλεση αν το script τρέχει απευθείας
if (require.main === module) {
  syncDatabase()
    .then(() => {
      console.log('\n✅ Sync completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Sync failed:', error);
      process.exit(1);
    });
}

module.exports = syncDatabase;