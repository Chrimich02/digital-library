import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Image as ImageIcon } from 'lucide-react';
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';
import tagService from '../../services/tagService';

const EditBookModal = ({ isOpen, onClose, book, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    language: 'el',
    pageCount: '',
    isbn: '',
    publisher: '',
    publishedDate: '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchTags();
    }
  }, [isOpen]);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        language: book.language || 'el',
        pageCount: book.pageCount || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publishedDate: book.publishedDate ? book.publishedDate.split('T')[0] : '',
      });

      // Set existing categories
      if (book.categories && Array.isArray(book.categories)) {
        const categoryIds = book.categories.map(cat => cat.id);
        setSelectedCategories(categoryIds);
      }

      // Set existing tags
      if (book.tags && Array.isArray(book.tags)) {
        const tagIds = book.tags.map(tag => tag.id);
        setSelectedTags(tagIds);
      }

      // Set existing cover preview
      if (book.coverImage) {
        const coverUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${book.coverImage.replace(/\\/g, '/')}`;
        setCoverPreview(coverUrl);
      }
    }
  }, [book]);

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

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleCoverChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Έλεγχος αν είναι εικόνα
      if (!selectedFile.type.startsWith('image/')) {
        setError('Παρακαλώ επιλέξτε μια εικόνα');
        return;
      }
      
      setCoverImage(selectedFile);
      
      // Δημιουργία preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Ο τίτλος είναι υποχρεωτικός');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare update data with proper types
      const updateData = {
        title: formData.title.trim(),
        author: formData.author.trim() || null,
        description: formData.description.trim() || null,
        language: formData.language,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : null,
        isbn: formData.isbn.trim() || null,
        publisher: formData.publisher.trim() || null,
        publishedDate: formData.publishedDate || null,
        categoryIds: JSON.stringify(selectedCategories),
        tagIds: JSON.stringify(selectedTags)
      };

      await bookService.updateBook(book.id, updateData);

      // Upload cover separately if changed
      if (coverImage) {
        const coverFormData = new FormData();
        coverFormData.append('cover', coverImage);
        await bookService.uploadCover(book.id, coverFormData);
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Αποτυχία ενημέρωσης βιβλίου';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    setError(null);
    setSelectedCategories([]);
    setSelectedTags([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Save className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Επεξεργασία Βιβλίου</h2>
              <p className="text-sm text-gray-600">Ενημερώστε τις πληροφορίες του βιβλίου</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Cover Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Εξώφυλλο
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              {coverPreview ? (
                <div className="relative inline-block">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-48 h-64 object-contain rounded mx-auto"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-2">
                    <label
                      htmlFor="cover-upload-edit"
                      className="cursor-pointer text-sm text-blue-600 hover:text-blue-700"
                    >
                      Αλλαγή εξωφύλλου
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    onChange={handleCoverChange}
                    accept="image/*"
                    className="hidden"
                    id="cover-upload-edit"
                    disabled={saving}
                  />
                  <label
                    htmlFor="cover-upload-edit"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Κλικ για επιλογή εξωφύλλου
                    </span>
                  </label>
                </>
              )}
              <input
                type="file"
                onChange={handleCoverChange}
                accept="image/*"
                className="hidden"
                id="cover-upload-edit"
                disabled={saving}
              />
            </div>
          </div>

          {/* Title (Required) */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Τίτλος *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Εισάγετε τον τίτλο του βιβλίου"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Συγγραφέας
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Εισάγετε το όνομα του συγγραφέα"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Περιγραφή
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={saving}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Εισάγετε την περιγραφή του βιβλίου"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Γλώσσα
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                disabled={saving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="el">Ελληνικά</option>
                <option value="en">Αγγλικά</option>
                <option value="fr">Γαλλικά</option>
                <option value="de">Γερμανικά</option>
                <option value="es">Ισπανικά</option>
                <option value="it">Ιταλικά</option>
              </select>
            </div>

            {/* Page Count */}
            <div>
              <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700 mb-2">
                Αριθμός Σελίδων
              </label>
              <input
                type="number"
                id="pageCount"
                name="pageCount"
                value={formData.pageCount}
                onChange={handleChange}
                disabled={saving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="π.χ. 250"
                min="1"
              />
            </div>
          </div>

          {/* ISBN and Publisher */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                disabled={saving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="π.χ. 978-3-16-148410-0"
              />
            </div>

            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                Εκδότης
              </label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                disabled={saving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Όνομα εκδότη"
              />
            </div>
          </div>

          {/* Published Date */}
          <div>
            <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700 mb-2">
              Ημερομηνία Έκδοσης
            </label>
            <input
              type="date"
              id="publishedDate"
              name="publishedDate"
              value={formData.publishedDate}
              onChange={handleChange}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Κατηγορίες
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      disabled={saving}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </label>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Επιλεγμένες: {selectedCategories.length} κατηγορί{selectedCategories.length === 1 ? 'α' : 'ες'}
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ετικέτες
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={saving}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Επιλεγμένες: {selectedTags.length} ετικέτ{selectedTags.length === 1 ? 'α' : 'ες'}
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Αποθήκευση...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Αποθήκευση Αλλαγών</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookModal;