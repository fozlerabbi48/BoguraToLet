
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

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

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
  </div>
);

// Login Required
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user ? children : <Navigate to="/login" replace />;
};

// Admin Only
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  const isAdmin =
    user && ['Super Admin', 'Admin', 'Moderator'].includes(user.role);

  return isAdmin ? children : <Navigate to="/" replace />;
};

// Auth Pages
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">

          <Navbar />

          <main className="flex-grow">
            <Routes>

              {/* Login and Register Only */}

              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />

              {/* All Pages Require Login */}

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/properties/:id"
                element={
                  <ProtectedRoute>
                    <PropertyDetails />
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

              {/* Admin Dashboard */}

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Unknown Routes */}

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />

            </Routes>
          </main>

          <Footer />

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
