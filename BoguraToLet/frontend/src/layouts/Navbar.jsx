import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  PlusCircle,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // স্ক্রল ডিটেকশন ও ব্যাকড্রপ ব্লার
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user && ['Super Admin', 'Admin', 'Moderator'].includes(user.role);
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md shadow-md border-b border-gray-200/80 py-1'
          : 'bg-white border-b border-gray-100 py-2.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* লোগো ও ব্র্যান্ড নাম */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
          >
            {/* আপনার নতুন বাসা ও টু-লেট সাইনবোর্ড লোগো */}
            <div className="w-11 h-11 flex items-center justify-center relative">
              <img
                src="/logo.png"
                alt="BoguraToLet"
                className="w-full h-full object-contain filter drop-shadow-sm group-hover:rotate-3 group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  // যদি কোনো কারণে logo.png না পায় তবে fallback হিসেবে logo.svg খুঁজবে
                  if (!e.target.src.endsWith('/logo.svg')) {
                    e.target.src = '/logo.svg';
                  }
                }}
              />
            </div>

            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">
                Bogura<span className="text-emerald-600 font-extrabold">ToLet</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                বগুড়ার সেরা বাসা ভাড়া
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">

            {/* হোম বাটন */}
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                isActive('/')
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <Home size={17} />
              <span>হোম</span>
            </Link>

            {/* বাসা ভাড়া দিন (শাইনিং অ্যানিমেশন বাটন) */}
            <Link
              to={user ? '/properties/create' : '/login?redirect=/properties/create'}
              className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              <PlusCircle size={17} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>বাসা ভাড়া দিন</span>
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">

                {/* আমার বিজ্ঞাপন */}
                <Link
                  to="/my-properties"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/my-properties')
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  আমার বিজ্ঞাপন
                </Link>

                {/* এডমিন প্যানেল বাটন (শুধু এডমিন দেখতে পারবে) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="relative px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 hover:bg-amber-100 flex items-center gap-1.5 transition shadow-xs hover:shadow-sm hover:scale-105 active:scale-95"
                  >
                    <ShieldCheck size={15} className="text-amber-600" />
                    <span>এডমিন প্যানেল</span>
                  </Link>
                )}

                {/* ইউজার তথ্য ও লগআউট */}
                <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200/60">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="লগআউট"
                    className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition ml-1"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl transition"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-xs hover:shadow-md transition active:scale-95"
                >
                  রেজিস্ট্রেশন
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger বাটন */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition active:scale-90"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-lg border-b border-gray-200 ${
          mobileMenuOpen ? 'max-h-96 opacity-100 py-4 px-4' : 'max-h-0 opacity-0 py-0 px-4'
        }`}
      >
        <div className="flex flex-col space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition flex items-center gap-2"
          >
            <Home size={18} /> হোম
          </Link>

          <Link
            to={user ? '/properties/create' : '/login?redirect=/properties/create'}
            onClick={() => setMobileMenuOpen(false)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <PlusCircle size={18} /> বাসা ভাড়া দিন
          </Link>

          {user ? (
            <>
              <Link
                to="/my-properties"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                আমার বিজ্ঞাপন
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition flex items-center gap-2"
                >
                  <ShieldCheck size={18} /> এডমিন ড্যাশবোর্ড
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition flex items-center gap-2"
              >
                <LogOut size={18} /> লগআউট ({user.name})
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center font-semibold text-gray-700 border border-gray-300 rounded-xl"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center font-semibold text-white bg-gray-900 rounded-xl"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
