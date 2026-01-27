import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Folder, 
  Edit, 
  Trash2,
  Book,
  Loader,
  X,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import categoryService from '../services/categoryService';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Αποτυχία φόρτωσης κατηγοριών');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      setDeletingCategory(null);
      toast.success('Η κατηγορία διαγράφηκε επιτυχώς');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Αποτυχία διαγραφής κατηγορίας');
    }
  };

  const CategoryCard = ({ category, index }) => (
    <div 
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 cursor-pointer transform hover:scale-105 hover:-translate-y-1 animate-fade-in group"
      style={{ 
        borderLeftColor: category.color,
        animationDelay: `${index * 50}ms`
      }}
      onClick={() => navigate(`/dashboard?category=${category.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <div 
            className="p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Folder 
              className="h-6 w-6"
              style={{ color: category.color }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCategory(category);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
            title="Επεξεργασία"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingCategory(category);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
            title="Διαγραφή"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
          <Book className="h-4 w-4" />
          <span>{category.bookCount || 0} βιβλί{category.bookCount !== 1 ? 'α' : 'ο'}</span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard?category=${category.id}`);
          }}
          className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          Προβολή Βιβλίων →
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl animate-pulse">
              <Folder className="w-10 h-10 text-white" />
            </div>
            <Loader className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">Φόρτωση κατηγοριών...</p>
          </div>
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
        {/* Header */}
        <div className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Πίσω στη Βιβλιοθήκη</span>
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Νέα Κατηγορία</span>
              </button>
            </div>
            
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  Κατηγορίες
                </h1>
              </div>
              <p className="text-gray-300 text-lg flex items-center gap-2">
                
                Οργανώστε τα βιβλία σας σε κατηγορίες για καλύτερη διαχείριση
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-8">
          {categories.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-white/20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                <Folder className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Δεν υπάρχουν κατηγορίες ακόμα
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Δημιουργήστε την πρώτη σας κατηγορία για να αρχίσετε να οργανώνετε τα βιβλία σας
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold text-lg transform hover:scale-105"
              >
                <Plus className="h-6 w-6" />
                <span>Δημιουργία Πρώτης Κατηγορίας</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CategoryModal
        isOpen={showCreateModal || editingCategory !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={() => {
          fetchCategories();
          setShowCreateModal(false);
          setEditingCategory(null);
        }}
      />

      {/* Delete Confirmation */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-red-100 rounded-2xl">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Διαγραφή Κατηγορίας</h3>
                <p className="text-sm text-gray-600">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-8 text-lg">
              Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "<strong>{deletingCategory.name}</strong>";
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDeletingCategory(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => handleDelete(deletingCategory.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Διαγραφή
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
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

// Category Modal Component
const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        color: category.color || '#6366f1',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#6366f1',
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Το όνομα της κατηγορίας είναι υποχρεωτικό');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (category) {
        await categoryService.updateCategory(category.id, formData);
        toast.success('Η κατηγορία ενημερώθηκε επιτυχώς');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Η κατηγορία δημιουργήθηκε επιτυχώς');
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Αποτυχία αποθήκευσης κατηγορίας');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const colorOptions = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? 'Επεξεργασία Κατηγορίας' : 'Νέα Κατηγορία'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
              <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Όνομα *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={saving}
              className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
              placeholder="π.χ. Μυθιστόρημα, Επιστήμη, Ιστορία"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Περιγραφή
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={saving}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none hover:border-gray-300"
              placeholder="Προαιρετική περιγραφή"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Χρώμα
            </label>
            <div className="grid grid-cols-8 gap-3">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  disabled={saving}
                  className={`h-12 w-12 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                    formData.color === color 
                      ? 'ring-4 ring-offset-2 ring-blue-500 shadow-lg scale-110' 
                      : 'hover:shadow-md'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold transform hover:scale-105"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {saving ? 'Αποθήκευση...' : (category ? 'Αποθήκευση Αλλαγών' : 'Δημιουργία')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Categories;