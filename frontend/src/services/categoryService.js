import api from './api';

const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response;
  },

  // Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response;
  },
};

export default categoryService;