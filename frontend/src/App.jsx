import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import GeneratorDashboard from './pages/GeneratorDashboard';
import RecyclerDashboard from './pages/RecyclerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route 
            path="/generator-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['generator']}>
                <GeneratorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recycler-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['recycler']}>
                <RecyclerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
