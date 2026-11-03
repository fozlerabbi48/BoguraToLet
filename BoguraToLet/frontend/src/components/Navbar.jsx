import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  User,
  LogOut,
  MessageSquare,
  Bell,
  ShieldCheck,
  ListFilter,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = !!user && ['Super Admin', 'Admin'].includes(user.role);

  const handlePostAdClick = () => {
    if (!user) {
      navigate('/login?redirect=/properties/create');
    } else {
      navigate('/properties/create');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* লোগো */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-gray-900 block leading-tight">
              Bogura<span className="text-emerald-600">ToLet</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase block">
              বগুড়ার টু-লেট পোর্টাল
            </span>
          </div>
        </Link>

        {/* ডানপাশের বাটনসমূহ */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePostAdClick}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>বাসা ভাড়া দিন</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-2 sm:pl-3">
              <Link
                to="/my-properties"
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                title="আমার বিজ্ঞাপন"
              >
                <ListFilter className="w-5 h-5" />
              </Link>

              <Link
                to="/chat"
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                title="মেসেজ"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              <Link
                to="/notifications"
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                title="নোটিফিকেশন"
              >
                <Bell className="w-5 h-5" />
              </Link>

              {/* অ্যাডমিন লিংক: শুধু Admin / Super Admin দেখতে পাবে */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 bg-gray-900 text-emerald-400 hover:bg-black px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition"
                  title="অ্যাডমিন কন্ট্রোল প্যানেল"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">অ্যাডমিন</span>
                </Link>
              )}

              <button
                onClick={logout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition ml-1"
                title="লগআউট"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-xl transition"
            >
              <User className="w-4 h-4" />
              <span>লগইন</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}