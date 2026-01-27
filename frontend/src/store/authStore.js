import { create } from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return response;
    } catch (error) {
      // Extract proper error message from backend response
      let errorMessage = 'Αποτυχία σύνδεσης. Παρακαλώ δοκιμάστε ξανά.';
      
      if (error.response) {
        // Backend returned an error response
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Λάθος email ή κωδικός πρόσβασης';
        } else if (error.response.status === 404) {
          errorMessage = 'Ο χρήστης δεν βρέθηκε';
        } else if (error.response.status === 500) {
          errorMessage = 'Σφάλμα διακομιστή. Παρακαλώ δοκιμάστε αργότερα.';
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Δεν υπάρχει σύνδεση με τον διακομιστή';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return response;
    } catch (error) {
      // Extract proper error message from backend response
      let errorMessage = 'Αποτυχία εγγραφής. Παρακαλώ δοκιμάστε ξανά.';
      
      if (error.response) {
        // Backend returned an error response
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Μη έγκυρα στοιχεία εγγραφής';
        } else if (error.response.status === 409) {
          errorMessage = 'Το email χρησιμοποιείται ήδη';
        } else if (error.response.status === 500) {
          errorMessage = 'Σφάλμα διακομιστή. Παρακαλώ δοκιμάστε αργότερα.';
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Δεν υπάρχει σύνδεση με τον διακομιστή';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export { useAuthStore };
export default useAuthStore;