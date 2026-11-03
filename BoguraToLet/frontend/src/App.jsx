import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetails from './pages/PropertyDetails';
import CreateProperty from './pages/CreateProperty';
import MyProperties from './pages/MyProperties';
import AdminDashboard from './pages/AdminDashboard';

// 🔒 শুধু অ্যাডমিনদের জন্য সিকিউরিটি গার্ড
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">যাচাই করা হচ্ছে...</div>;
  }

  const isAdmin = user && ['Super Admin', 'Admin', 'Moderator'].includes(user.role);

  return isAdmin ? children : <Navigate to="/" replace />;
}

// 🔐 লগইন গার্ড
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">যাচাই করা হচ্ছে...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
          <div>
            <Navbar />
            <main>
              <Routes>
                {/* পাবলিক রুট */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />

                {/* লগইন করা থাকতে হবে */}
                <Route
                  path="/properties/create"
                  element={
                    <ProtectedRoute>
                      <CreateProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-properties"
                  element={
                    <ProtectedRoute>
                      <MyProperties />
                    </ProtectedRoute>
                  }
                />

                {/* শুধু অ্যাডমিন */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* ভুল লিংকে গেলে হোমপেজ */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}