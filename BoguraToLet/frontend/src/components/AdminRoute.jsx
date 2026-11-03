import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-500">যাচাই করা হচ্ছে...</div>;
  }

  // যদি লগইন না থাকে অথবা রোল Super Admin / Admin না হয়, সরাসরি হোমপেজে পাঠিয়ে দেবে
  const isAdmin = user && ['Super Admin', 'Admin'].includes(user.role);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
