import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './layouts/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetails from './pages/PropertyDetails';
import CreateProperty from './pages/CreateProperty';
import MyProperties from './pages/MyProperties';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// লগইন না থাকলে সরাসরি /login পেজে পাঠিয়ে দেবে
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// শুধুমাত্র Super Admin ও Admin-এর জন্য
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const isAdmin = user && ['Super Admin', 'Admin', 'Moderator'].includes(user.role);
  return isAdmin ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* শুধুমাত্র Login এবং Register সবার জন্য উন্মুক্ত */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* বাকি সব পেজে ঢুকতে হলে বাধ্যতামূলক লগইন/রেজিস্ট্রেশন লাগবে */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              {/* বিজ্ঞাপন পোস্ট করার রুটগুলো অবশ্যই :id এর আগে থাকবে */}
              <Route
                path="/properties/create"
                element={
                  <ProtectedRoute>
                    <CreateProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-property"
                element={
                  <ProtectedRoute>
                    <CreateProperty />
                  </ProtectedRoute>
                }
              />

              {/* প্রপার্টি ডিটেইলস পেজ */}
              <Route
                path="/properties/:id"
                element={
                  <ProtectedRoute>
                    <PropertyDetails />
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

              {/* অ্যাডমিন ড্যাশবোর্ড */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* অন্য কোনো ভুল লিঙ্কে গেলে হোমে রিডাইরেক্ট করবে */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
