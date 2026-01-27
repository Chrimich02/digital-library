const db = require('../models');
const axios = require('axios');

// ============================================================================
// HELPER - DELAY ΓΙΑ RATE LIMITING
// ============================================================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// ΜΕΤΑΦΡΑΣΕΙΣ ΚΑΤΗΓΟΡΙΩΝ
// ============================================================================

const CATEGORY_TRANSLATIONS = {
  'ιστορία': 'history',
  'ιστορία & πολιτισμός': 'history',
  'μουσική': 'music',
  'τέχνες & μουσική': 'music',
  'τέχνη': 'art',
  'επιστήμη': 'science',
  'επιστήμη & τεχνολογία': 'technology',
  'τεχνολογία': 'technology',
  'λογοτεχνία': 'fiction',
  'λογοτεχνία & μυθιστορήματα': 'fiction',
  'μυθιστορήματα': 'fiction',
  'οικονομία': 'economics',
  'επιχειρήσεις': 'business',
  'οικονομία & επιχειρήσεις': 'business economics',
  'ψυχολογία': 'psychology',
  'προσωπική ανάπτυξη': 'self-help',
  'προσωπική ανάπτυξη & ψυχολογία': 'psychology',
  'φιλοσοφία': 'philosophy',
  'κοινωνικές επιστήμες': 'social sciences',
  'κοινωνικές επιστήμες & φιλοσοφία': 'philosophy',
  'βιογραφίες': 'biography',
  'βιογραφία': 'biography',
  'επιστημονική φαντασία': 'science fiction',
  'sci-fi': 'science fiction',
  'φαντασία': 'fantasy',
  'μυστήριο': 'mystery',
  'θρίλερ': 'thriller',
  'ρομάντζο': 'romance',
  'αυτοβελτίωση': 'self-help',
  'υγεία': 'health',
  'μαγειρική': 'cooking',
  'ταξίδια': 'travel',
  'αθλητισμός': 'sports',
  'θρησκεία': 'religion',
  'εκπαίδευση': 'education',
  'παιδικά': 'juvenile fiction',
  'υπολογιστές': 'computers',
  'προγραμματισμός': 'computers programming'
};

const translateCategory = (category) => {
  const lowerCat = category.toLowerCase().trim();
  return CATEGORY_TRANSLATIONS[lowerCat] || category;
};

// ============================================================================
// GOOGLE BOOKS API - ΜΕ RETRY LOGIC
// ============================================================================

const searchGoogleBooksWithRetry = async (query, maxResults = 20, minYear = 2010, startIndex = 0, retries = 3) => {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Exponential backoff: 500ms, 1s, 2s
      const waitTime = attempt === 1 ? 500 : Math.pow(2, attempt - 1) * 1000;
      await delay(waitTime);
      
      console.log(`   🔍 Query: "${query}" (attempt ${attempt}/${retries})`);

      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: query,
          key: apiKey,
          maxResults: maxResults,
          startIndex: startIndex,
          orderBy: 'relevance',
          printType: 'books',
          langRestrict: 'en'
        },
        timeout: 15000
      });

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      const books = response.data.items
        .map(item => {
          const volumeInfo = item.volumeInfo;
          
          let publishYear = null;
          if (volumeInfo.publishedDate) {
            publishYear = parseInt(volumeInfo.publishedDate.substring(0, 4));
          }
          
          return {
            id: item.id,
            googleBooksId: item.id,
            title: volumeInfo.title,
            subtitle: volumeInfo.subtitle || null,
            author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Άγνωστος Συγγραφέας',
            coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || null,
            coverUrlMedium: volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://') || null,
            publishYear: publishYear,
            publisher: volumeInfo.publisher || null,
            categories: volumeInfo.categories || [],
            pageCount: volumeInfo.pageCount || null,
            language: volumeInfo.language || 'en',
            isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || null,
            description: volumeInfo.description || null,
            previewLink: volumeInfo.previewLink?.replace('http://', 'https://') || null,
            infoLink: volumeInfo.infoLink?.replace('http://', 'https://') || null,
            averageRating: volumeInfo.averageRating || null,
            ratingsCount: volumeInfo.ratingsCount || null
          };
        })
        .filter(book => {
          if (!book.coverUrl) return false;
          if (book.publishYear && book.publishYear < minYear) return false;
          return true;
        });

      console.log(`   ✅ Found: ${books.length} books`);
      return books;

    } catch (error) {
      if (error.response?.status === 429 && attempt < retries) {
        console.log(`   ⏳ Rate limit hit, waiting before retry ${attempt + 1}...`);
        continue;
      }
      
      console.error(`   ❌ Error (attempt ${attempt}): ${error.message}`);
      
      if (attempt === retries) {
        return [];
      }
    }
  }
  
  return [];
};

// ============================================================================
// HELPER - ΤΥΧΑΙΟΣ ΑΡΙΘΜΟΣ ΓΙΑ STARTINDEX
// ============================================================================

const getRandomStartIndex = () => {
  return Math.floor(Math.random() * 6) * 10; // 0, 10, 20, 30, 40, 50
};

// ============================================================================
// ΑΝΑΛΥΣΗ ΒΙΒΛΙΩΝ ΧΡΗΣΤΗ
// ============================================================================

const analyzeUserBooks = (userBooks) => {
  const categoryCount = new Map();
  const authorCount = new Map();

  userBooks.forEach(book => {
    // Μέτρηση κατηγοριών
    if (book.categories) {
      book.categories.forEach(cat => {
        if (cat.name) {
          const count = categoryCount.get(cat.name) || 0;
          categoryCount.set(cat.name, count + 1);
        }
      });
    }

    // Μέτρηση συγγραφέων
    if (book.author && book.author !== 'Άγνωστος Συγγραφέας') {
      const count = authorCount.get(book.author) || 0;
      authorCount.set(book.author, count + 1);
    }
  });

  const topCategories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const topAuthors = Array.from(authorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return { topCategories, topAuthors };
};

// ============================================================================
// HELPER - FALLBACK QUERIES
// ============================================================================

const getFallbackQueries = (category) => {
  const fallbacks = {
    'technology': ['subject:"computers"'],
    'science': ['subject:"physics"'],
    'business economics': ['subject:"business"'],
    'business': ['subject:"entrepreneurship"'],
    'economics': ['subject:"finance"'],
    'music': ['subject:"musicians"'],
    'art': ['subject:"artists"'],
    'history': ['subject:"historical"'],
    'fiction': ['subject:"novels"'],
    'philosophy': ['subject:"philosophers"'],
    'psychology': ['subject:"mental health"'],
    'social sciences': ['subject:"sociology"'],
    'biography': ['subject:"memoir"'],
    'science fiction': ['subject:"sci-fi"'],
    'fantasy': ['subject:"epic fantasy"'],
    'mystery': ['subject:"detective"'],
    'thriller': ['subject:"suspense"'],
    'romance': ['subject:"love stories"'],
    'self-help': ['subject:"personal development"'],
    'cooking': ['subject:"recipes"'],
    'travel': ['subject:"tourism"'],
    'health': ['subject:"wellness"'],
    'sports': ['subject:"athletics"'],
    'education': ['subject:"teaching"'],
    'religion': ['subject:"faith"'],
    'computers': ['subject:"programming"'],
    'computers programming': ['subject:"coding"']
  };
  return fallbacks[category.toLowerCase()] || [];
};

// ============================================================================
// 🚀 OPTIMIZED - ΔΗΜΙΟΥΡΓΙΑ ΠΡΟΤΑΣΕΩΝ (PARALLEL REQUESTS)
// ============================================================================

const generateRecommendations = async (userCategories, userBooks) => {
  const sections = [];
  const seenBooks = new Set();

  if (userBooks && userBooks.length > 0) {
    userBooks.forEach(book => {
      seenBooks.add(book.title.toLowerCase().trim());
    });
  }

  console.log('\n🚀 Generating recommendations (PARALLEL MODE)...\n');

  // ΠΕΡΙΠΤΩΣΗ 1: Χρήστης ΜΕ βιβλία
  if (userBooks && userBooks.length > 0) {
    console.log(`📚 User has ${userBooks.length} books - analyzing...`);

    const analysis = analyzeUserBooks(userBooks);
    console.log(`   Top categories: ${analysis.topCategories.map(c => c.name).join(', ')}`);
    console.log(`   Top authors: ${analysis.topAuthors.map(a => a.name).join(', ')}`);

    // ✅ AUTHORS SECTION REMOVED - Not useful for recommendations

    // ✅ SECTION 1: ΟΛΕΣ οι κατηγορίες με βιβλία - PARALLEL
    console.log(`\n📚 Fetching ${analysis.topCategories.length} categories (PARALLEL)...`);

    const categoryPromises = analysis.topCategories.map(async (category) => {
      const translated = translateCategory(category.name);
      console.log(`   - Queuing: ${category.name} (${category.count} books) → ${translated}`);

      const query = `subject:"${translated}"`;
      const startIndex = getRandomStartIndex();
      let books = await searchGoogleBooksWithRetry(query, 30, 2010, startIndex, 3);

      // Fallback if needed
      if (books.length < 8) {
        const fallbackQueries = getFallbackQueries(translated);
        if (fallbackQueries.length > 0) {
          const extraBooks = await searchGoogleBooksWithRetry(fallbackQueries[0], 20, 2010, 0, 2);
          books = [...books, ...extraBooks];
        }
      }

      return { category, books };
    });

    const categoryResults = await Promise.all(categoryPromises);

    categoryResults.forEach(({ category, books }) => {
      const filteredBooks = books.filter(book => {
        const key = book.title.toLowerCase().trim();
        if (seenBooks.has(key)) return false;
        seenBooks.add(key);
        return true;
      });

      if (filteredBooks.length > 0) {
        sections.push({
          id: `category-${category.name.replace(/\s+/g, '-')}`,
          title: `${category.name}`,
          subtitle: `Έχετε ${category.count} ${category.count === 1 ? 'βιβλίο' : 'βιβλία'}`,
          icon: '📚',
          books: filteredBooks.slice(0, 12)
        });
        console.log(`   ✅ Added "${category.name}" with ${filteredBooks.length} books`);
      }
    });

    // ✅ SECTION 2: 2 Κενές Κατηγορίες - PARALLEL
    if (userCategories && userCategories.length > 0) {
      const categoriesWithBooks = new Set(analysis.topCategories.map(c => c.name.toLowerCase()));
      const categoriesWithoutBooks = userCategories
        .filter(cat => !categoriesWithBooks.has(cat.name.toLowerCase()))
        .slice(0, 2);

      if (categoriesWithoutBooks.length > 0) {
        console.log(`\n📂 Fetching ${categoriesWithoutBooks.length} empty categories (PARALLEL)...`);

        const emptyPromises = categoriesWithoutBooks.map(async (category) => {
          const translated = translateCategory(category.name);
          console.log(`   - Queuing: ${category.name} → ${translated}`);

          const query = `subject:"${translated}"`;
          const startIndex = getRandomStartIndex();
          let books = await searchGoogleBooksWithRetry(query, 30, 2010, startIndex, 2);

          if (books.length < 8) {
            const fallbackQueries = getFallbackQueries(translated);
            if (fallbackQueries.length > 0) {
              const extraBooks = await searchGoogleBooksWithRetry(fallbackQueries[0], 20, 2010, 0, 2);
              books = [...books, ...extraBooks];
            }
          }

          return { category, books };
        });

        const emptyResults = await Promise.all(emptyPromises);

        emptyResults.forEach(({ category, books }) => {
          const filteredBooks = books.filter(book => {
            const key = book.title.toLowerCase().trim();
            if (seenBooks.has(key)) return false;
            seenBooks.add(key);
            return true;
          });

          if (filteredBooks.length > 0) {
            sections.push({
              id: `category-${category.name.replace(/\s+/g, '-')}`,
              title: `${category.name}`,
              subtitle: 'Ξεκινήστε να διαβάζετε',
              icon: '🌟',
              books: filteredBooks.slice(0, 12)
            });
            console.log(`   ✅ Added "${category.name}" with ${filteredBooks.length} books`);
          }
        });
      }
    }
  }
  // ΠΕΡΙΠΤΩΣΗ 2: Χρήστης ΧΩΡΙΣ βιβλία αλλά ΜΕ κατηγορίες - PARALLEL
  else if (userCategories && userCategories.length > 0) {
    console.log(`📂 User has ${userCategories.length} categories (no books yet) - PARALLEL MODE`);

    const promises = userCategories.map(async (category) => {
      const translated = translateCategory(category.name);
      console.log(`   - Queuing: ${category.name} → ${translated}`);

      const query = `subject:"${translated}"`;
      const startIndex = getRandomStartIndex();
      let books = await searchGoogleBooksWithRetry(query, 30, 2010, startIndex, 3);

      if (books.length < 8) {
        const fallbackQueries = getFallbackQueries(translated);
        if (fallbackQueries.length > 0) {
          const extraBooks = await searchGoogleBooksWithRetry(fallbackQueries[0], 20, 2010, 0, 2);
          books = [...books, ...extraBooks];
        }
      }

      return { category, books };
    });

    const results = await Promise.all(promises);

    results.forEach(({ category, books }) => {
      const filteredBooks = books.filter(book => {
        const key = book.title.toLowerCase().trim();
        if (seenBooks.has(key)) return false;
        seenBooks.add(key);
        return true;
      });

      if (filteredBooks.length > 0) {
        sections.push({
          id: `category-${category.name.replace(/\s+/g, '-')}`,
          title: `${category.name}`,
          subtitle: 'Προτάσεις για εσάς',
          icon: '📚',
          books: filteredBooks.slice(0, 12)
        });
        console.log(`   ✅ Added "${category.name}" with ${filteredBooks.length} books`);
      }
    });
  }
  else {
    // ΠΕΡΙΠΤΩΣΗ 3: Χρήστης ΧΩΡΙΣ βιβλία και ΧΩΡΙΣ κατηγορίες - ΔΗΜΟΦΙΛΗ ΒΙΒΛΙΑ
    console.log('📌 No books and no categories - showing popular books');

    const popularSections = [
      { 
        query: 'subject:fiction', 
        title: 'Λογοτεχνία',
        subtitle: 'Δημοφιλή μυθιστορήματα',
        icon: '📖'
      },
      { 
        query: 'subject:technology', 
        title: 'Τεχνολογία',
        subtitle: 'Σύγχρονη τεχνολογία και καινοτομία',
        icon: '💻'
      },
      { 
        query: 'subject:self-help', 
        title: 'Προσωπική Ανάπτυξη',
        subtitle: 'Βελτιώστε τον εαυτό σας',
        icon: '💡'
      },
      { 
        query: 'subject:business', 
        title: 'Επιχειρηματικότητα',
        subtitle: 'Business και οικονομία',
        icon: '💼'
      },
      { 
        query: 'subject:science', 
        title: 'Επιστήμη',
        subtitle: 'Ανακαλύψτε τον κόσμο της επιστήμης',
        icon: '🔬'
      },
      { 
        query: 'subject:history', 
        title: 'Ιστορία',
        subtitle: 'Μάθετε από το παρελθόν',
        icon: '📜'
      }
    ];

    console.log(`\n🌟 Fetching ${popularSections.length} popular sections (PARALLEL)...`);

    const popularPromises = popularSections.map(async (section) => {
      console.log(`   - Queuing: ${section.title}`);
      const startIndex = getRandomStartIndex();
      const books = await searchGoogleBooksWithRetry(section.query, 30, 2010, startIndex, 3);
      return { ...section, books };
    });

    const popularResults = await Promise.all(popularPromises);

    popularResults.forEach(({ query, title, subtitle, icon, books }) => {
      const filteredBooks = books.filter(book => {
        const key = book.title.toLowerCase().trim();
        if (seenBooks.has(key)) return false;
        seenBooks.add(key);
        return true;
      });

      if (filteredBooks.length > 0) {
        sections.push({
          id: `popular-${title.toLowerCase().replace(/\s+/g, '-')}`,
          title: title,
          subtitle: subtitle,
          icon: icon,
          books: filteredBooks.slice(0, 12)
        });
        console.log(`   ✅ Added "${title}" with ${filteredBooks.length} books`);
      }
    });
  }

  return sections;
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('\n========================================');
    console.log('🎯 PERSONALIZED RECOMMENDATIONS (OPTIMIZED)');
    console.log('========================================\n');

    const startTime = Date.now();

    const userCategories = await db.Category.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']]
    });

    const userBooks = await db.Book.findAll({
      where: { userId },
      include: [
        { model: db.Category, as: 'categories' }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📚 User has ${userBooks.length} books`);
    console.log(`📂 User has ${userCategories.length} categories`);

    const sections = await generateRecommendations(userCategories, userBooks);

    const totalBooks = sections.reduce((acc, s) => acc + s.books.length, 0);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n========================================');
    console.log(`✅ Generated ${sections.length} sections with ${totalBooks} books`);
    console.log(`⚡ Total time: ${elapsedTime}s`);
    sections.forEach(section => {
      console.log(`   • ${section.title}: ${section.books.length} books`);
    });
    console.log('========================================\n');

    res.json({
      success: true,
      data: {
        sections: sections,
        totalBooks: totalBooks
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση προτάσεων',
      error: error.message
    });
  }
};

// Search endpoint
const searchBooks = async (req, res) => {
  try {
    const { q, limit = 24 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Παρακαλώ εισάγετε τουλάχιστον 2 χαρακτήρες'
      });
    }

    console.log(`🔎 Searching for: "${q}"`);
    const books = await searchGoogleBooksWithRetry(q, parseInt(limit), 2010, 0, 3);

    res.json({
      success: true,
      data: {
        query: q,
        books: books,
        total: books.length
      }
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Σφάλμα κατά την αναζήτηση',
      error: error.message
    });
  }
};

module.exports = {
  getRecommendations,
  searchBooks
};