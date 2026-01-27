import React, { useState, useEffect } from 'react';
import { X, Upload, Loader, Check } from 'lucide-react';
import bookService from '../../services/bookService';
import categoryService from '../../services/categoryService';
import tagService from '../../services/tagService';

const UploadBookModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
    publishedYear: '',
    publisher: '',
  });
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [hasPrefillData, setHasPrefillData] = useState(false);
  const [suggestedCategoryId, setSuggestedCategoryId] = useState(null); // ✅ ΝΕΟ

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

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

  // ✅ ΕΝΗΜΕΡΩΜΕΝΟ: Prefill data με auto-select κατηγορίας
  useEffect(() => {
    if (categories.length === 0) return; // Περίμενε να φορτώσουν οι κατηγορίες

    const storedData = sessionStorage.getItem('bookPrefillData');
    if (storedData) {
      try {
        const prefillData = JSON.parse(storedData);
        console.log('Loaded prefill data from sessionStorage:', prefillData);
        
        // Προσυμπλήρωση fields
        setFormData(prev => ({
          ...prev,
          title: prefillData.title || prev.title,
          author: prefillData.author || prev.author,
          description: prefillData.description || prev.description,
          isbn: prefillData.isbn || prev.isbn,
          publishedYear: prefillData.publishedDate?.toString() || prev.publishedYear,
          publisher: prefillData.publisher || prev.publisher
        }));
        
        // ✅ ΝΕΟ: Auto-select κατηγορίας
        if (prefillData.suggestedCategoryName) {
          console.log('Looking for category:', prefillData.suggestedCategoryName);
          
          // Βρες την κατηγορία που ταιριάζει
          const matchedCategory = categories.find(cat => {
            const categoryNameLower = cat.name.toLowerCase().trim();
            const suggestedNameLower = prefillData.suggestedCategoryName.toLowerCase().trim();
            
            // Exact match ή partial match
            return categoryNameLower === suggestedNameLower || 
                   categoryNameLower.includes(suggestedNameLower) ||
                   suggestedNameLower.includes(categoryNameLower);
          });
          
          if (matchedCategory) {
            console.log('✅ Found matching category:', matchedCategory.name);
            setSelectedCategories([matchedCategory.id]);
            setSuggestedCategoryId(matchedCategory.id);
          } else {
            console.log('⚠️  No matching category found');
          }
        }
        
        setHasPrefillData(true);
        
        // ✅ Καθάρισε το sessionStorage μετά το φόρτωμα
        sessionStorage.removeItem('bookPrefillData');
        
      } catch (e) {
        console.error('Error parsing prefill data:', e);
      }
    }
  }, [categories]); // ✅ Εκτέλεση όταν φορτώσουν οι κατηγορίες

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const isPDF = selectedFile.type === 'application/pdf' || 
                    selectedFile.name.toLowerCase().endsWith('.pdf');
      
      if (!isPDF) {
        setError('Μόνο αρχεία PDF επιτρέπονται');
        return;
      }
      
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('Το αρχείο είναι πολύ μεγάλο (μέγιστο 50MB)');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleCoverImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Μόνο εικόνες επιτρέπονται για το εξώφυλλο');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Η εικόνα είναι πολύ μεγάλη (μέγιστο 5MB)');
        return;
      }

      setCoverImage(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Παρακαλώ επιλέξτε ένα αρχείο PDF');
      return;
    }

    if (!formData.title.trim()) {
      setError('Ο τίτλος είναι υποχρεωτικός');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadData = new FormData();
      
      uploadData.append('book', file);
      
      if (coverImage) {
        uploadData.append('cover', coverImage);
      }
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          uploadData.append(key, formData[key]);
        }
      });

      uploadData.append('categoryIds', JSON.stringify(selectedCategories));
      uploadData.append('tagIds', JSON.stringify(selectedTags));

      await bookService.uploadBook(uploadData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      onSuccess();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Αποτυχία ανεβάσματος βιβλίου');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ανέβασμα Βιβλίου</h2>
            {hasPrefillData && (
              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                Προσυμπληρωμένα στοιχεία από προτάσεις
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Αρχείο Βιβλίου * (μόνο PDF)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {file ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          PDF
                        </span>
                        {file.name}
                      </span>
                    ) : (
                      'Κάντε κλικ για να επιλέξετε αρχείο PDF'
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Μόνο PDF αρχεία • Μέγιστο μέγεθος: 50MB
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Εξώφυλλο (προαιρετικό)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                disabled={uploading}
                className="hidden"
                id="cover-upload"
              />
              <label htmlFor="cover-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {coverImage ? coverImage.name : 'Επιλέξτε εικόνα εξωφύλλου'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Μέγιστο μέγεθος: 5MB</p>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Τίτλος *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={uploading}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Εισάγετε τον τίτλο του βιβλίου"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Συγγραφέας
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Εισάγετε το όνομα του συγγραφέα"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Περιγραφή
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={uploading}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Προαιρετική περιγραφή του βιβλίου"
            />
          </div>

          {/* ISBN, Year, Publisher */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                disabled={uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ISBN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Έτος Έκδοσης
              </label>
              <input
                type="number"
                name="publishedYear"
                value={formData.publishedYear}
                onChange={handleInputChange}
                disabled={uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="π.χ. 2023"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Εκδότης
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                disabled={uploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Εκδότης"
              />
            </div>
          </div>

          {/* ✅ ΕΝΗΜΕΡΩΜΕΝΟ: Categories με suggested badge */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Κατηγορίες
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                {categories.map(category => {
                  const isSuggested = category.id === suggestedCategoryId;
                  const isSelected = selectedCategories.includes(category.id);
                  
                  return (
                    <label
                      key={category.id}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition ${
                        isSuggested 
                          ? 'bg-purple-50 border-2 border-purple-300' 
                          : 'hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(category.id)}
                        disabled={uploading}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                      {isSuggested && isSelected && (
                        <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Προτεινόμενη
                        </span>
                      )}
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                    </label>
                  );
                })}
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
                    disabled={uploading}
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

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ανέβασμα σε εξέλιξη...</span>
                <span className="text-blue-600 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Ανέβασμα...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Ανέβασμα Βιβλίου
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadBookModal;