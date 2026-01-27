import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, BookOpen, Plus, Filter, Grid, List, Eye, Download, Edit2, Trash2, LogOut, User, Library } from 'lucide-react';
import { toast } from 'react-hot-toast';
import bookService from '../services/bookService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import UploadBookModal from '../components/common/UploadBookModal';
import EditBookModal from '../components/common/EditBookModal';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchTags();
    
    const categoryFromUrl = searchParams.get('category');
    const tagFromUrl = searchParams.get('tag');
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory(null);
    }

    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    } else {
      setSelectedTag(null);
    }
  }, [searchParams]);

  // Auto-open upload modal with prefilled data from recommendations
  useEffect(() => {
    // Check sessionStorage for upload trigger
    const shouldOpen = sessionStorage.getItem('shouldOpenUpload');
    
    if (shouldOpen === 'true') {
      console.log('Opening upload modal from sessionStorage');
      
      // Clear the flag
      sessionStorage.removeItem('shouldOpenUpload');
      
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        setShowUploadModal(true);
      }, 100);
    }
  }, []);

  useEffect(() => {
    filterBooks(searchTerm, selectedCategory, selectedTag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedTag, books, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks({
        limit: 100
      });
      setBooks(response.data.books);
      setFilteredBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Αποτυχία φόρτωσης βιβλίων');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagService.getTags();
      setTags(response.data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    filterBooks(value, selectedCategory, selectedTag);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    filterBooks(searchTerm, categoryId, selectedTag);
  };

  const handleTagFilter = (tagId) => {
    setSelectedTag(tagId);
    filterBooks(searchTerm, selectedCategory, tagId);
  };

  const filterBooks = (search, category, tag) => {
    let filtered = books;

    if (category) {
      filtered = filtered.filter(book => 
        book.categories && book.categories.some(cat => cat.id === category)
      );
    }

    if (tag) {
      filtered = filtered.filter(book => 
        book.tags && book.tags.some(t => t.id === tag)
      );
    }

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredBooks(filtered);
  };

  const handleViewBook = (bookId) => {
    navigate(`/reader/${bookId}`);
  };

  const handleDownloadBook = async (bookId, bookTitle, fileType) => {
    try {
      const blob = await bookService.downloadBook(bookId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bookTitle}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Το βιβλίο λήφθηκε επιτυχώς');
    } catch (error) {
      console.error('Error downloading book:', error);
      toast.error('Αποτυχία λήψης βιβλίου');
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await bookService.deleteBook(bookId);
      toast.success('Το βιβλίο διαγράφηκε επιτυχώς');
      setDeletingBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Αποτυχία διαγραφής βιβλίου');
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchBooks();
    fetchCategories();
    fetchTags();
    toast.success('Το βιβλίο ανέβηκε επιτυχώς!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Αποσυνδεθήκατε επιτυχώς');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl animate-pulse">
            <Library className="w-10 h-10 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Φόρτωση βιβλιοθήκης...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header with Glass Effect */}
        <div className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo + Title */}
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg transform hover:scale-110 hover:rotate-3 transition-all duration-300">
                  <Library className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                    Ψηφιακή Βιβλιοθήκη
                  </h1>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    Η συλλογή σας
                  </p>
                </div>
              </div>
              
              {/* User Info & Logout */}
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300">
                  <User className="w-4 h-4 text-gray-300" />
                  <span className="text-sm text-gray-200 font-medium">
                    {(() => {
                      const user = JSON.parse(localStorage.getItem('user') || '{}');
                      if (user.firstName && user.lastName) {
                        return `${user.firstName} ${user.lastName}`;
                      } else if (user.firstName) {
                        return user.firstName;
                      } else if (user.username) {
                        return user.username;
                      }
                      return 'Χρήστης';
                    })()}
                  </span>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-sm text-white rounded-xl hover:bg-red-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-red-500/50 transform hover:scale-105"
                  title="Αποσύνδεση"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Αποσύνδεση</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section with Glass Effect */}
        <div className="px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
          {/* Search + Actions Row */}
          <div className="flex gap-3 items-center mb-3">
            {/* Search */}
            <form onSubmit={(e) => e.preventDefault()} className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Αναζήτηση βιβλίων, συγγραφέων..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white transition-all duration-300 hover:border-gray-300"
                />
              </div>
            </form>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="Προβολή Πλέγματος"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title="Προβολή Λίστας"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Ανέβασμα Βιβλίου</span>
            </button>

            {/* Categories Button */}
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold transform hover:scale-105"
            >
              <Filter className="w-4 h-4" />
              <span>Κατηγορίες</span>
            </button>

            {/* Tags Button */}
            <button
              onClick={() => navigate('/tags')}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Ετικέτες</span>
            </button>

            {/* Recommendations Button */}
            <button
              onClick={() => navigate('/recommendations')}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-semibold transform hover:scale-105"
            >
              {/* 💡 Lightbulb Icon για Προτάσεις */}
              <svg 
                className="w-4 h-4" 
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
              <span>Προτάσεις</span>
            </button>
          </div>

          {/* Category Pills */}
          {categories.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Κατηγορίες</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    selectedCategory === null
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Όλα ({books.length})
                </button>
                
                {categories.map(category => {
                  const bookCount = books.filter(book => 
                    book.categories && book.categories.some(cat => cat.id === category.id)
                  ).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === category.id ? category.color : undefined
                      }}
                    >
                      {category.name} ({bookCount})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag Pills */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Ετικέτες</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTagFilter(null)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    selectedTag === null
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Όλα
                </button>
                
                {tags.map(tag => {
                  const bookCount = books.filter(book => 
                    book.tags && book.tags.some(t => t.id === tag.id)
                  ).length;
                  
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagFilter(tag.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                        selectedTag === tag.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      #{tag.name} ({bookCount})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Books */}
        <div className="p-6">
          {filteredBooks.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-white/20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm || selectedCategory || selectedTag ? 'Δεν βρέθηκαν βιβλία' : 'Δεν υπάρχουν βιβλία ακόμα'}
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm || selectedCategory || selectedTag
                  ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης ή φίλτρα' 
                  : 'Ξεκινήστε να δημιουργείτε τη ψηφιακή σας βιβλιοθήκη ανεβάζοντας το πρώτο σας βιβλίο'}
              </p>
              {!searchTerm && !selectedCategory && !selectedTag && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg font-semibold transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Ανεβάστε το Πρώτο σας Βιβλίο
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              : "space-y-4"
            }>
              {filteredBooks.map((book, index) => (
                viewMode === 'grid' ? (
                  <div
                    key={book.id}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 transform hover:scale-105 hover:-translate-y-1 animate-fade-in group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div 
                      className="cursor-pointer relative overflow-hidden"
                      onClick={() => setSelectedBook(book)}
                    >
                      <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
                        {book.coverImage ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${book.coverImage.replace(/\\/g, '/')}`}
                            alt={book.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <BookOpen 
                          className="w-16 h-16 text-gray-300" 
                          style={{ display: book.coverImage ? 'none' : 'flex' }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-4">
                      <h3 
                        className="font-bold text-sm text-gray-900 mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => setSelectedBook(book)}
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 truncate" title={book.author || 'Άγνωστος Συγγραφέας'}>
                        {book.author || 'Άγνωστος Συγγραφέας'}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {book.categories && book.categories.slice(0, 1).map((category) => (
                          <span
                            key={category.id}
                            className="px-3 py-1 text-xs rounded-full text-white font-medium shadow-sm"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        ))}
                        {book.tags && book.tags.slice(0, 1).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-1.5 mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBook(book.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Προβολή"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadBook(book.id, book.title, book.fileType);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Λήψη"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBook(book);
                            setShowEditModal(true);
                          }}
                          className="px-2 py-2 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Επεξεργασία"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingBook(book);
                          }}
                          className="px-2 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                          title="Διαγραφή"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* ΠΡΟΣΘΗΚΗ: Reading Progress για Grid View */}
                      {book.progress && book.progress.percentage > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-gray-600">Πρόοδος</span>
                            <span className="text-xs font-bold text-blue-600">
                              {Math.round(book.progress.percentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                              style={{ width: `${book.progress.percentage}%` }}
                            />
                          </div>
                          {book.progress.isCompleted && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-green-600 font-semibold">Ολοκληρωμένο</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    key={book.id}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 flex gap-5 border border-white/20 transform hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div 
                      className="cursor-pointer flex-shrink-0 group"
                      onClick={() => setSelectedBook(book)}
                    >
                      <div className="w-24 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center p-2 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        {book.coverImage ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${book.coverImage.replace(/\\/g, '/')}`}
                            alt={book.title}
                            className="w-full h-full object-contain rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <BookOpen 
                          className="w-10 h-10 text-gray-300" 
                          style={{ display: book.coverImage ? 'none' : 'flex' }}
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 
                          className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => setSelectedBook(book)}
                        >
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 font-medium">{book.author || 'Άγνωστος Συγγραφέας'}</p>
                        
                        {book.description && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                            {book.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-2">
                          {book.categories && book.categories.map((category) => (
                            <span
                              key={category.id}
                              className="px-3 py-1.5 text-xs rounded-full text-white font-semibold shadow-sm"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          ))}
                          {book.tags && book.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-3 py-1.5 text-xs rounded-full bg-purple-100 text-purple-700 font-semibold"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>

                        {/* ΠΡΟΣΘΗΚΗ: Reading Progress για List View */}
                        {book.progress && book.progress.percentage > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Πρόοδος Ανάγνωσης</span>
                              <span className="text-sm font-bold text-blue-600">
                                {Math.round(book.progress.percentage)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                                style={{ width: `${book.progress.percentage}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs text-gray-600">
                                Σελίδα {book.progress.currentPage} από {book.progress.totalPages || book.pageCount}
                              </span>
                              {book.progress.isCompleted && (
                                <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Ολοκληρωμένο
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBook(book.id);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Προβολή</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadBook(book.id, book.title, book.fileType);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all duration-300 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          <Download className="w-4 h-4" />
                          <span>Λήψη</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBook(book);
                            setShowEditModal(true);
                          }}
                          className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-all duration-300 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingBook(book);
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadBookModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          prefillData={location.state?.prefillData || null}
        />
      )}

      {/* Book Details Modal */}
      {selectedBook && !showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-scale-in">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{selectedBook.title}</h2>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110"
                >
                  <span className="text-3xl leading-none">&times;</span>
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Συγγραφέας</p>
                  <p className="text-lg text-gray-900 font-medium">{selectedBook.author || 'Άγνωστος'}</p>
                </div>
                
                {selectedBook.description && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Περιγραφή</p>
                    <p className="text-gray-700 leading-relaxed">{selectedBook.description}</p>
                  </div>
                )}
                
                {selectedBook.isbn && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">ISBN</p>
                    <p className="text-gray-900 font-mono">{selectedBook.isbn}</p>
                  </div>
                )}

                {/* ΠΡΟΣΘΗΚΗ: Reading Progress στο Modal */}
                {selectedBook.progress && selectedBook.progress.percentage > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Πρόοδος Ανάγνωσης</p>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Σελίδα {selectedBook.progress.currentPage} από {selectedBook.progress.totalPages || selectedBook.pageCount}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {Math.round(selectedBook.progress.percentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                          style={{ width: `${selectedBook.progress.percentage}%` }}
                        />
                      </div>
                      {selectedBook.progress.isCompleted && (
                        <div className="flex items-center gap-2 mt-3 text-green-600">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">Ολοκληρωμένο!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedBook.categories && selectedBook.categories.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Κατηγορίες</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.categories.map((category) => (
                        <span
                          key={category.id}
                          className="px-4 py-2 text-sm rounded-full text-white font-semibold shadow-sm"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBook.tags && selectedBook.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ετικέτες</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBook.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-4 py-2 text-sm rounded-full bg-purple-100 text-purple-700 font-semibold"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-6">
                  <button
                    onClick={() => handleViewBook(selectedBook.id)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Προβολή Βιβλίου
                  </button>
                  <button
                    onClick={() => handleDownloadBook(selectedBook.id, selectedBook.title, selectedBook.fileType)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Λήψη
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBook && (
        <EditBookModal
          isOpen={showEditModal}
          book={selectedBook}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBook(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedBook(null);
            fetchBooks();
          }}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-red-100 rounded-2xl">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Αποσύνδεση</h3>
                <p className="text-sm text-gray-600">Είστε σίγουροι;</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-8 text-lg">
              Θέλετε να αποσυνδεθείτε από τον λογαριασμό σας;
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Αποσύνδεση
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Book Confirmation Modal */}
      {deletingBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-red-100 rounded-2xl">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Διαγραφή Βιβλίου</h3>
                <p className="text-sm text-gray-600">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-8 text-lg">
              Είστε σίγουροι ότι θέλετε να διαγράψετε το βιβλίο "<strong>{deletingBook.title}</strong>";
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDeletingBook(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => handleDeleteBook(deletingBook.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Διαγραφή
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;