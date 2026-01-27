import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Recommendations from './pages/Recommendations';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookDetails from './pages/BookDetails';
import BookReader from './pages/BookReader';
import Categories from './pages/Categories';
import Tags from './pages/Tags';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/books/:id" 
          element={
            <ProtectedRoute>
              <BookDetails />
            </ProtectedRoute>
          } 
        />
        
        {/* 👇 ΑΛΛΑΓΗ ΕΔΩ: :id -> :bookId */}
        <Route 
          path="/reader/:bookId" 
          element={
            <ProtectedRoute>
              <BookReader />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tags" 
          element={
            <ProtectedRoute>
              <Tags />
            </ProtectedRoute>
          } 
        />
        <Route path="/recommendations" element={<Recommendations />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;