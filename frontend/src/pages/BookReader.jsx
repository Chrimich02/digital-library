import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import bookService from '../services/bookService';
import annotationService from '../services/annotationService';
import progressService from '../services/progressService';
import PDFViewer from '../components/reader/PDFViewer';
import AnnotationSidebar from '../components/reader/AnnotationSidebar';
import ReaderToolbar from '../components/reader/ReaderToolbar';
import ReaderSettings from '../components/reader/ReaderSettings';

const BookReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [bookUrl, setBookUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookFormat, setBookFormat] = useState(null);
  
  // Reader state
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  // UI state
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('all');
  
  // Annotations state
  const [annotations, setAnnotations] = useState([]);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  
  // Settings state
  const [readerSettings, setReaderSettings] = useState({
    theme: 'dark',
    brightness: 100,
    fontSize: 100
  });

  // Sync fontSize with scale
  useEffect(() => {
    const newScale = readerSettings.fontSize / 100;
    setScale(newScale);
  }, [readerSettings.fontSize]);

  // Sync scale with fontSize when changed from toolbar
  const handleScaleChange = (newScale) => {
    setScale(newScale);
    setReaderSettings(prev => ({
      ...prev,
      fontSize: Math.round(newScale * 100)
    }));
  };

  const fetchBookData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.getBook(bookId);
      const bookData = response.data.book;
      setBook(bookData);
      
      // Detect book format from fileType
      const format = bookData.fileType?.toLowerCase() || 'pdf';
      setBookFormat(format);
      
      // Fetch the book file
      const bookBlob = await bookService.viewBook(bookId);
      const url = URL.createObjectURL(bookBlob);
      setBookUrl(url);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Αποτυχία φόρτωσης βιβλίου');
      setLoading(false);
    }
  }, [bookId]);

  const fetchAnnotations = useCallback(async () => {
    try {
      const response = await annotationService.getBookAnnotations(bookId);
      setAnnotations(response.data.annotations);
    } catch (error) {
      console.error('Error fetching annotations:', error);
    }
  }, [bookId]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await progressService.getProgress(bookId);
      if (response.data.progress.currentPage) {
        setCurrentPage(response.data.progress.currentPage);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, [bookId]);

  const saveProgress = useCallback(async () => {
    try {
      await progressService.updateProgress(bookId, {
        currentPage,
        totalPages: numPages
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [bookId, currentPage, numPages]);

  useEffect(() => {
    fetchBookData();
    fetchAnnotations();
    fetchProgress();
  }, [fetchBookData, fetchAnnotations, fetchProgress]);

  useEffect(() => {
    if (currentPage > 0 && numPages > 0) {
      const timer = setTimeout(() => {
        saveProgress();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, numPages, saveProgress]);

  const handleCreateHighlight = async (highlightData) => {
    try {
      const annotationData = {
        bookId,
        type: 'highlight',
        highlightedText: highlightData.text,
        color: highlightColor,
        pageNumber: highlightData.pageNumber || currentPage,
        positions: highlightData.positions || []
      };

      const response = await annotationService.createAnnotation(annotationData);
      
      setAnnotations([...annotations, response.data.annotation]);
      
      // Auto-disable highlight mode after creating highlight
      setHighlightMode(false);
      
      toast.success('Η επισήμανση προστέθηκε');
    } catch (error) {
      console.error('Error creating highlight:', error);
      toast.error('Αποτυχία δημιουργίας επισήμανσης');
    }
  };

  const handleCreateNote = async (noteText) => {
    try {
      const response = await annotationService.createAnnotation({
        bookId,
        type: 'note',
        content: noteText,
        pageNumber: currentPage
      });
      
      setAnnotations([...annotations, response.data.annotation]);
      toast.success('Η σημείωση προστέθηκε');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Αποτυχία δημιουργίας σημείωσης');
    }
  };

  const handleCreateBookmark = async () => {
    try {
      const existingBookmark = annotations.find(
        a => a.type === 'bookmark' && a.pageNumber === currentPage
      );

      if (existingBookmark) {
        toast.error('Υπάρχει ήδη σελιδοδείκτης σε αυτή τη σελίδα');
        return;
      }

      const response = await annotationService.createAnnotation({
        bookId,
        type: 'bookmark',
        pageNumber: currentPage
      });
      
      setAnnotations([...annotations, response.data.annotation]);
      toast.success('Ο σελιδοδείκτης προστέθηκε');
    } catch (error) {
      console.error('Error creating bookmark:', error);
      toast.error('Αποτυχία δημιουργίας σελιδοδείκτη');
    }
  };

  const handleDeleteAnnotation = async (annotationId) => {
    try {
      await annotationService.deleteAnnotation(annotationId);
      setAnnotations(annotations.filter(a => a.id !== annotationId));
      toast.success('Η σημείωση διαγράφηκε');
    } catch (error) {
      console.error('Error deleting annotation:', error);
      toast.error('Αποτυχία διαγραφής σημείωσης');
    }
  };

  const handleUpdateAnnotation = async (annotationId, data) => {
    try {
      const response = await annotationService.updateAnnotation(annotationId, data);
      setAnnotations(annotations.map(a => 
        a.id === annotationId ? response.data.annotation : a
      ));
      toast.success('Η σημείωση ενημερώθηκε');
    } catch (error) {
      console.error('Error updating annotation:', error);
      toast.error('Αποτυχία ενημέρωσης σημείωσης');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
    }
  };

  const handleAnnotationClick = (annotation) => {
    if (annotation.pageNumber) {
      setCurrentPage(annotation.pageNumber);
    }
  };

  useEffect(() => {
    return () => {
      if (bookUrl) {
        URL.revokeObjectURL(bookUrl);
      }
    };
  }, [bookUrl]);

  // Only PDF format is supported
  const supportsAnnotations = bookFormat === 'pdf';

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
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Φόρτωση βιβλίου...</p>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
      </div>
    );
  }

  if (!book || !bookUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-2xl mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white text-xl mb-6">Δεν βρέθηκε το βιβλίο</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
          >
            Επιστροφή στη Βιβλιοθήκη
          </button>
        </div>
      </div>
    );
  }

  // Render viewer - PDF only
  const renderViewer = () => {
    if (bookFormat === 'pdf') {
      return (
        <PDFViewer
          pdfUrl={bookUrl}
          currentPage={currentPage}
          scale={scale}
          onPageChange={setCurrentPage}
          onDocumentLoad={(numPages) => setNumPages(numPages)}
          annotations={annotations}
          highlightMode={highlightMode}
          highlightColor={highlightColor}
          onCreateHighlight={handleCreateHighlight}
          theme={readerSettings.theme}
          brightness={readerSettings.brightness}
        />
      );
    } else {
      // Non-PDF format - show error message
      return (
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Μη Υποστηριζόμενος Τύπος Αρχείου</h3>
            <p className="text-gray-400 mb-4">
              Η εφαρμογή υποστηρίζει μόνο αρχεία <strong className="text-blue-400">PDF</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Το αρχείο <strong className="text-orange-400">.{bookFormat}</strong> δεν μπορεί να ανοίξει.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
              >
                Επιστροφή στη Βιβλιοθήκη
              </button>
              <p className="text-xs text-gray-500">
                💡 Tip: Μετατρέψτε το αρχείο σε PDF για να το ανοίξετε
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        readerSettings.theme === 'dark' 
          ? 'bg-slate-900' 
          : readerSettings.theme === 'sepia'
          ? 'bg-amber-50'
          : 'bg-gray-100'
      }`}
    >
      <ReaderToolbar
        book={book}
        currentPage={currentPage}
        numPages={numPages}
        scale={scale}
        onScaleChange={handleScaleChange}
        onPageChange={handlePageChange}
        onBack={() => navigate('/dashboard')}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          {renderViewer()}
        </div>

        {showSidebar && supportsAnnotations && (
          <AnnotationSidebar
            annotations={annotations}
            currentPage={currentPage}
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            onAnnotationClick={handleAnnotationClick}
            onDeleteAnnotation={handleDeleteAnnotation}
            onUpdateAnnotation={handleUpdateAnnotation}
            onCreateNote={handleCreateNote}
            highlightMode={highlightMode}
            onToggleHighlightMode={() => setHighlightMode(!highlightMode)}
            highlightColor={highlightColor}
            onHighlightColorChange={setHighlightColor}
            onCreateBookmark={handleCreateBookmark}
          />
        )}
        
        {/* Info message for non-PDF formats */}
        {showSidebar && !supportsAnnotations && (
          <div className="w-96 bg-slate-800/95 backdrop-blur-xl border-l border-slate-700/50 flex items-center justify-center p-8">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 text-sm mb-3">
                Οι σημειώσεις υποστηρίζονται μόνο για PDF
              </p>
              <p className="text-gray-500 text-xs">
                Αρχείο: {bookFormat?.toUpperCase()}
              </p>
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <ReaderSettings
          settings={readerSettings}
          onSettingsChange={setReaderSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default BookReader;