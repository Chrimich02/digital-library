import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Tag, 
  Edit, 
  Trash2,
  Book,
  Loader,
  Hash,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import tagService from '../services/tagService';

const Tags = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getTags();
      setTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Αποτυχία φόρτωσης ετικετών');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await tagService.deleteTag(id);
      setTags(tags.filter(t => t.id !== id));
      setDeletingTag(null);
      toast.success('Η ετικέτα διαγράφηκε επιτυχώς');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Αποτυχία διαγραφής ετικέτας');
    }
  };

  const TagCard = ({ tag, index }) => {
    const maxSize = Math.max(...tags.map(t => t.bookCount || 0));
    const size = tag.bookCount ? (tag.bookCount / maxSize) * 100 : 30;
    const fontSize = Math.max(14, Math.min(24, size / 4));

    return (
      <div className="group relative animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
        <div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 border-2 border-purple-200 hover:border-purple-400 cursor-pointer transform hover:scale-110"
          style={{ 
            transform: `scale(${0.8 + (size / 500)})`,
            transition: 'all 0.3s'
          }}
          onClick={() => navigate(`/dashboard?tag=${tag.id}`)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-purple-600" />
              <span 
                className="font-bold text-gray-900"
                style={{ fontSize: `${fontSize}px` }}
              >
                {tag.name}
              </span>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTag(tag);
                }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingTag(tag);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-600 font-medium">
            <Book className="h-3 w-3" />
            <span>{tag.bookCount || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-2xl animate-pulse">
            <Tag className="w-10 h-10 text-white" />
          </div>
          <Loader className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Φόρτωση ετικετών...</p>
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
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowBulkCreateModal(true)}
                  className="flex items-center space-x-2 px-5 py-3 bg-slate-700/50 backdrop-blur-sm border-2 border-purple-500 text-purple-300 rounded-xl hover:bg-slate-700 hover:border-purple-400 transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Μαζική Δημιουργία</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Νέα Ετικέτα</span>
                </button>
              </div>
            </div>
            
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  Ετικέτες
                </h1>
              </div>
              <p className="text-gray-300 text-lg flex items-center gap-2">
                
                Προσθέστε ετικέτες στα βιβλία σας για γρήγορο φιλτράρισμα και οργάνωση
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {tags.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-white/20 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                <Tag className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Δεν υπάρχουν ετικέτες ακόμα
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Δημιουργήστε την πρώτη σας ετικέτα για να οργανώσετε τα βιβλία σας
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Plus className="h-6 w-6" />
                  <span>Δημιουργία Πρώτης Ετικέτας</span>
                </button>
                <button
                  onClick={() => setShowBulkCreateModal(true)}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-2xl hover:bg-purple-50 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Plus className="h-6 w-6" />
                  <span>Μαζική Δημιουργία</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 mb-6 animate-fade-in border border-white/20">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  
                  Σύννεφο Ετικετών
                </h3>
                <p className="text-sm text-gray-600">Το μέγεθος αντικατοπτρίζει τον αριθμό των βιβλίων με κάθε ετικέτα</p>
              </div>
              
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/20">
                <div className="flex flex-wrap gap-6 items-center justify-center">
                  {tags.map((tag, index) => (
                    <TagCard key={tag.id} tag={tag} index={index} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <TagModal
        isOpen={showCreateModal || editingTag !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTag(null);
        }}
        tag={editingTag}
        onSuccess={() => {
          fetchTags();
          setShowCreateModal(false);
          setEditingTag(null);
        }}
      />

      {/* Bulk Create Modal */}
      <BulkTagModal
        isOpen={showBulkCreateModal}
        onClose={() => setShowBulkCreateModal(false)}
        onSuccess={() => {
          fetchTags();
          setShowBulkCreateModal(false);
        }}
      />

      {/* Delete Confirmation */}
      {deletingTag && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-red-100 rounded-2xl">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Διαγραφή Ετικέτας</h3>
                <p className="text-sm text-gray-600">Αυτή η ενέργεια δεν μπορεί να αναιρεθεί</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-8 text-lg">
              Είστε σίγουροι ότι θέλετε να διαγράψετε την ετικέτα "<strong>#{deletingTag.name}</strong>";
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDeletingTag(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => handleDelete(deletingTag.id)}
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

// Single Tag Modal
const TagModal = ({ isOpen, onClose, tag, onSuccess }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tag) {
      setName(tag.name || '');
    } else {
      setName('');
    }
  }, [tag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Το όνομα της ετικέτας είναι υποχρεωτικό');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (tag) {
        await tagService.updateTag(tag.id, { name: name.trim() });
        toast.success('Η ετικέτα ενημερώθηκε επιτυχώς');
      } else {
        await tagService.createTag({ name: name.trim() });
        toast.success('Η ετικέτα δημιουργήθηκε επιτυχώς');
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Αποτυχία αποθήκευσης ετικέτας');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {tag ? 'Επεξεργασία Ετικέτας' : 'Νέα Ετικέτα'}
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
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Όνομα Ετικέτας *
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 hover:border-gray-300 font-medium"
                placeholder="π.χ. αγαπημένο, προς-ανάγνωση, μυθιστόρημα"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              💡 Χρησιμοποιήστε πεζά, χωρίς κενά. Παράδειγμα: αγαπημένο, must-read, sci-fi
            </p>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {saving ? 'Αποθήκευση...' : (tag ? 'Αποθήκευση Αλλαγών' : 'Δημιουργία')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Create Modal
const BulkTagModal = ({ isOpen, onClose, onSuccess }) => {
  const [tagNames, setTagNames] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tags = tagNames
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tags.length === 0) {
      setError('Παρακαλώ εισάγετε τουλάχιστον ένα όνομα ετικέτας');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await tagService.createBulkTags(tags);
      toast.success(`${tags.length} ετικέτες δημιουργήθηκαν επιτυχώς`);
      onSuccess();
      setTagNames('');
    } catch (err) {
      setError(err.message || 'Αποτυχία δημιουργίας ετικετών');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const tagCount = tagNames.split(',').filter(t => t.trim().length > 0).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Μαζική Δημιουργία Ετικετών</h2>
            <p className="text-sm text-gray-600 mt-1">Δημιουργήστε πολλές ετικέτες ταυτόχρονα</p>
          </div>
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
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Ονόματα Ετικετών (διαχωρισμένα με κόμμα)
            </label>
            <textarea
              value={tagNames}
              onChange={(e) => setTagNames(e.target.value)}
              disabled={saving}
              rows="6"
              className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none hover:border-gray-300 font-medium"
              placeholder="αγαπημένο, προς-ανάγνωση, μυθιστόρημα, non-fiction, must-read, sci-fi"
            />
            <div className="flex items-center justify-between mt-2 ml-1">
              <p className="text-xs text-gray-500">
                💡 Διαχωρίστε τις ετικέτες με κόμματα
              </p>
              {tagCount > 0 && (
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  {tagCount} ετικέτ{tagCount !== 1 ? 'ες' : 'α'}
                </span>
              )}
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
              disabled={saving || tagCount === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {saving ? 'Δημιουργία...' : `Δημιουργία ${tagCount > 0 ? tagCount : ''} ${tagCount !== 1 ? 'Ετικετών' : 'Ετικέτας'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Tags;