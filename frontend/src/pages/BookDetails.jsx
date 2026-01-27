import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Book, 
  User, 
  Calendar, 
  FileText, 
  Hash,
  Globe,
  Building,
  Trash2,
  Edit,
  Play,
  Download,
  Bookmark,
  MessageSquare,
  Highlighter
} from 'lucide-react';
import bookService from '../services/bookService';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBookDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.getBook(id);
      setBook(response.data.book);
    } catch (err) {
      console.error('Error fetching book:', err);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await bookService.deleteBook(id);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete book');
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await bookService.downloadBook(id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${book.title}.${book.fileType}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download book');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This book does not exist'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
      <Icon className="h-5 w-5 text-purple-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-base text-gray-900 mt-1">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Library</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-8">
              {/* Cover Image */}
              <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                {book.coverImage ? (
                  <img
                    src={`http://localhost:5000/${book.coverImage}`}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Book className="h-24 w-24 text-purple-400" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 space-y-3">
                <button 
                  onClick={() => navigate(`/read/${id}`)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium"
                >
                  <Play className="h-5 w-5" />
                  <span>Start Reading</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 pb-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h3>
                <StatCard
                  icon={Bookmark}
                  label="Bookmarks"
                  value={book.annotations?.filter(a => a.type === 'bookmark').length || 0}
                  color="bg-blue-500"
                />
                <StatCard
                  icon={Highlighter}
                  label="Highlights"
                  value={book.annotations?.filter(a => a.type === 'highlight').length || 0}
                  color="bg-yellow-500"
                />
                <StatCard
                  icon={MessageSquare}
                  label="Notes"
                  value={book.annotations?.filter(a => a.type === 'note').length || 0}
                  color="bg-green-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              
              {/* File Type Badge */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 uppercase">
                  {book.fileType}
                </span>
                <span className="text-sm text-gray-500">
                  {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              {book.description && (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </>
              )}
            </div>

            {/* Reading Progress */}
            {book.progress && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reading Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Page {book.progress.currentPage} of {book.progress.totalPages || book.pageCount}
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        {Math.round(book.progress.percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-300"
                        style={{ width: `${book.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                  {book.progress.lastReadAt && (
                    <p className="text-sm text-gray-600">
                      Last read: {new Date(book.progress.lastReadAt).toLocaleDateString('el-GR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {book.progress.isCompleted && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Book Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={User} label="Author" value={book.author} />
                <InfoItem icon={Hash} label="ISBN" value={book.isbn} />
                <InfoItem icon={Building} label="Publisher" value={book.publisher} />
                <InfoItem 
                  icon={Calendar} 
                  label="Published Date" 
                  value={book.publishedDate ? new Date(book.publishedDate).toLocaleDateString('el-GR') : null} 
                />
                <InfoItem icon={Globe} label="Language" value={book.language?.toUpperCase()} />
                <InfoItem icon={FileText} label="Pages" value={book.pageCount} />
              </div>
            </div>

            {/* Categories & Tags */}
            {(book.categories?.length > 0 || book.tags?.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
                
                {book.categories?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {book.categories.map(category => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: `${category.color}20`,
                            color: category.color
                          }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {book.tags?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Added</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(book.createdAt).toLocaleDateString('el-GR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(book.updatedAt).toLocaleDateString('el-GR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Book ID</span>
                  <span className="text-gray-900 font-mono text-xs">{book.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Book</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<strong>{book.title}</strong>"? This will permanently remove the book and all associated data including annotations and reading progress.
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetails;