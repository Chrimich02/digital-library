import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader, Library, BookOpen } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Το email είναι υποχρεωτικό';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Το email δεν είναι έγκυρο';
    }
    
    if (!formData.password) {
      errors.password = 'Ο κωδικός είναι υποχρεωτικός';
    } else if (formData.password.length < 6) {
      errors.password = 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await login(formData);
      
      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberedPassword', formData.password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      // Error is already handled by the auth store
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 pt-6 pb-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <Library className="w-10 h-10 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Ψηφιακή Βιβλιοθήκη
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-gray-300 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            Καλώς ήρθατε πίσω!
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg animate-shake">
                <p className="font-medium">⚠️ Σφάλμα Σύνδεσης</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Διεύθυνση Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-blue-600">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-3.5 border-2 ${
                    validationErrors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-xl focus:ring-2 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300`}
                  placeholder="you@example.com"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                  <span>⚠️</span>
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Κωδικός Πρόσβασης
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-12 pr-4 py-3.5 border-2 ${
                    validationErrors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                  } rounded-xl focus:ring-2 focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300`}
                  placeholder="••••••••"
                />
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in">
                  <span>⚠️</span>
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all duration-200"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                  Να με θυμάσαι
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-white text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 hover:bg-right-bottom focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-3 h-6 w-6" />
                  Σύνδεση...
                </>
              ) : (
                <>
                  <LogIn className="mr-3 h-6 w-6" />
                  Σύνδεση
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Δεν έχετε λογαριασμό;{' '}
              <Link
                to="/register"
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:underline"
              >
                Εγγραφείτε τώρα
              </Link>
            </p>
          </div>
        </div>

      </div>

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
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .bg-size-200 {
          background-size: 200% 100%;
        }
        
        .hover\\:bg-right-bottom:hover {
          background-position: right bottom;
        }
      `}</style>
    </div>
  );
};

export default Login;