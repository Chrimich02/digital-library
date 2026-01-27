import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 ExternalLink, BookOpen, Loader, ChevronLeft, ChevronRight, 
  ArrowLeft, Library, Search, Plus, Upload, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import recommendationService from '../services/recommendationService';

const Recommendations = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationService.getRecommendations();
      setSections(response.data.sections || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Αποτυχία φόρτωσης προτάσεων');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await recommendationService.searchBooks(searchQuery, 24);
      setSearchResults(response.data.books || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Σφάλμα αναζήτησης');
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery, handleSearch]);

  const handleAddBook = (book) => {
    setSelectedBook(book);
    setShowAddModal(true);
  };

  const scroll = (sectionId, direction) => {
    const container = document.getElementById(`scroll-${sectionId}`);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const BookCard = ({ book }) => (
    <div className="flex-shrink-0 w-36 group">
      {/* Cover */}
      <div 
        className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => handleAddBook(book)}
      >
        {book.coverUrl || book.coverUrlMedium ? (
          <img
            src={book.coverUrlMedium || book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100"
          style={{ display: (book.coverUrl || book.coverUrlMedium) ? 'none' : 'flex' }}
        >
          <BookOpen className="w-10 h-10 text-purple-300" />
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddBook(book);
            }}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Προσθήκη
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <h3 
          className="font-semibold text-xs text-gray-800 line-clamp-2 cursor-pointer hover:text-purple-600 transition-colors leading-tight"
          onClick={() => handleAddBook(book)}
        >
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {book.author}
        </p>
        {book.publishYear && (
          <p className="text-xs text-gray-400 mt-0.5">
            {book.publishYear}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-300" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg">
                    {/* 💡 Lightbulb Icon για Προτάσεις */}
                    <svg 
                      className="w-6 h-6 text-white" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M9 18h6"/>
                      <path d="M10 22h4"/>
                      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Ανακαλύψτε Βιβλία
                    </h1>
                    <p className="text-xs text-gray-400">
                      Προτάσεις βασισμένες στα ενδιαφέροντά σας
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-gray-300 rounded-xl hover:bg-slate-600/50 transition-colors"
              >
                <Library className="w-4 h-4" />
                <span>Βιβλιοθήκη</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Αναζητήστε βιβλία, συγγραφείς, θέματα..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/95 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searching && (
                <Loader className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600 animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="mb-8">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-gray-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Αποτελέσματα για "{searchQuery}"
                  </h2>
                  {searchResults.length > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                      {searchResults.length} βιβλία
                    </span>
                  )}
                </div>

                {searching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {searchResults.map((book, index) => (
                      <BookCard key={book.id || index} book={book} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Δεν βρέθηκαν αποτελέσματα
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Φόρτωση προτάσεων...</p>
              </div>
            </div>
          ) : searchQuery.length < 2 && (
            /* Sections */
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id} className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-gray-200/50">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                        {section.subtitle && (
                          <p className="text-sm text-gray-600">{section.subtitle}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => scroll(section.id, 'left')}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => scroll(section.id, 'right')}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Books Row */}
                  <div
                    id={`scroll-${section.id}`}
                    className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {section.books.map((book, index) => (
                      <BookCard key={book.id || index} book={book} />
                    ))}
                  </div>
                </div>
              ))}

              {sections.length === 0 && (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-gray-200/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Δεν βρέθηκαν προτάσεις
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Προσθέστε βιβλία με κατηγορίες στη βιβλιοθήκη σας για εξατομικευμένες προτάσεις
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Πίσω στη Βιβλιοθήκη
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && selectedBook && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Προσθήκη Βιβλίου</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedBook(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Book Info */}
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {selectedBook.coverUrl || selectedBook.coverUrlMedium ? (
                    <img
                      src={selectedBook.coverUrlMedium || selectedBook.coverUrl}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{selectedBook.author}</p>
                  {selectedBook.publishYear && (
                    <p className="text-xs text-gray-400 mb-2">{selectedBook.publishYear}</p>
                  )}
                  {selectedBook.categories && selectedBook.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedBook.categories.slice(0, 3).map((category, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedBook.averageRating && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-xs text-gray-600">
                        {selectedBook.averageRating.toFixed(1)}
                        {selectedBook.ratingsCount && ` (${selectedBook.ratingsCount})`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedBook.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {selectedBook.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // ✅ Βρες το section από το οποίο προέρχεται το βιβλίο
                    const currentSection = sections.find(s => 
                      s.books.some(b => 
                        (b.id && b.id === selectedBook.id) || 
                        (b.title === selectedBook.title && b.author === selectedBook.author)
                      )
                    );
                    
                    const prefillData = {
                      title: selectedBook.title,
                      author: selectedBook.author,
                      description: selectedBook.description,
                      publishedDate: selectedBook.publishYear,
                      pageCount: selectedBook.pageCount,
                      isbn: selectedBook.isbn,
                      language: selectedBook.language,
                      publisher: selectedBook.publisher,
                      // ✅ ΝΕΟ: Προσθήκη category name
                      suggestedCategoryName: currentSection?.title || null
                    };
                    
                    console.log('Saving prefill data with category:', prefillData);
                    
                    // Store in sessionStorage
                    sessionStorage.setItem('bookPrefillData', JSON.stringify(prefillData));
                    sessionStorage.setItem('shouldOpenUpload', 'true');
                    
                    setShowAddModal(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Upload className="w-5 h-5" />
                  Έχω το PDF - Ανέβασμα
                </button>

                <button
                  onClick={() => {
                    const url = selectedBook.previewLink || selectedBook.infoLink;
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } else {
                      toast.error('Δεν υπάρχει διαθέσιμο link');
                    }
                    setShowAddModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Δες στο Google Books
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Το Google Books προσφέρει προεπισκόπηση πολλών βιβλίων
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Recommendations;