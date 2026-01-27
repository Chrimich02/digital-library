import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, BookOpen, Loader, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import recommendationService from '../../services/recommendationService';
import UploadBookModal from '../Upload/UploadBookModal';

const BookRecommendations = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleViewBook = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // ✅ Handle Upload με prefill data
  const handleUploadBook = (book, sectionTitle) => {
    const prefillData = {
      title: book.title,
      author: book.author,
      description: book.description,
      isbn: book.isbn,
      publishedDate: book.publishYear,
      publisher: book.publisher,
      pageCount: book.pageCount,
      suggestedCategoryName: sectionTitle
    };
    
    sessionStorage.setItem('bookPrefillData', JSON.stringify(prefillData));
    console.log('Saved prefill data with category:', prefillData);
    
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    sessionStorage.removeItem('bookPrefillData');
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    toast.success('Το βιβλίο ανέβηκε με επιτυχία!');
  };

  const scroll = (sectionIndex, direction) => {
    const container = document.getElementById(`section-scroll-${sectionIndex}`);
    if (container) {
      const scrollAmount = 250;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-purple-600 animate-spin" />
          <span className="ml-3 text-gray-600">Αναζήτηση προτάσεων...</span>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl shadow-lg">
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Προτάσεις για Εσάς
            </h2>
            <p className="text-sm text-gray-500">
              Βασισμένες στη βιβλιοθήκη σας
            </p>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <div 
            key={sectionIndex}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{section.title}</h3>
                  {section.subtitle && (
                    <p className="text-xs text-gray-500">{section.subtitle}</p>
                  )}
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex gap-1">
                <button
                  onClick={() => scroll(sectionIndex, 'left')}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => scroll(sectionIndex, 'right')}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Books Row */}
            <div
              id={`section-scroll-${sectionIndex}`}
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {section.books.map((book, bookIndex) => (
                <div
                  key={book.id || bookIndex}
                  className="flex-shrink-0 w-40 group"
                >
                  {/* Cover */}
                  <div 
                    className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-300 mb-3 cursor-pointer"
                    onClick={() => handleViewBook(book.infoLink || book.previewLink)}
                  >
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ display: book.coverUrl ? 'none' : 'flex' }}
                    >
                      <BookOpen className="w-12 h-12 text-gray-300" />
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center gap-1 text-white text-sm font-medium">
                        <ExternalLink className="w-4 h-4" />
                        <span>Προβολή</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <h4 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate mb-1">
                    {book.author}
                  </p>
                  {book.publishYear && (
                    <p className="text-xs text-gray-400 mb-2">
                      {book.publishYear}
                    </p>
                  )}

                  {/* ✅ Κουμπί Ανεβάσματος */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadBook(book, section.title);
                    }}
                    className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Ανέβασμα PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Hide Scrollbar */}
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadBookModal
          onClose={handleCloseModal}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default BookRecommendations;