import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  PlusCircle,
  MessageSquare,
  ListFilter,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = !!user && ["Super Admin", "Admin", "Moderator"].includes(user.role);

  const handlePostAdClick = () => {
    setMobileMenuOpen(false);
    if (!user) {
      navigate("/login?redirect=/create-property");
    } else {
      navigate("/create-property");
    }
  };

  const isBrowseActive = location.pathname === "/" || location.pathname === "/properties";
  const isPostActive =
    location.pathname === "/create-property" || location.pathname === "/properties/create";
  const isChatActive = location.pathname === "/chat";
  const isMyPropsActive = location.pathname === "/my-properties";
  const isAdminActive = location.pathname === "/admin";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between">
        {/* লোগো */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-transform duration-200 active:scale-95"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:rotate-3 transition duration-300">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 block leading-tight">
              Bogura<span className="text-emerald-600">ToLet</span>
            </span>
            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase block flex items-center gap-1">
              <span>বগুড়ার টু-লেট পোর্টাল</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-400 inline" />
            </span>
          </div>
        </Link>

        {/* ডেস্কটপ ন্যাভবার মেনু (সিরিয়াল অনুযায়ী সাজানো) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {/* ১: বাড়ি খুঁজুন (পোস্ট দেখার পেজ) */}
          <Link
            to="/"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              isBrowseActive
                ? "bg-emerald-50 text-emerald-700 shadow-xs"
                : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>বাড়ি খুঁজুন</span>
          </Link>

          {/* ২: বাড়ি ভাড়া দিন (পোস্ট করার পেজ) - Highlighted CTA */}
          <button
            onClick={handlePostAdClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all duration-300 cursor-pointer shadow-md ${
              isPostActive
                ? "bg-emerald-700 text-white shadow-emerald-700/30 ring-2 ring-emerald-400"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25 hover:scale-102 active:scale-98"
            }`}
          >
            <PlusCircle className="w-4 h-4 animate-pulse" />
            <span>বাড়ি ভাড়া দিন</span>
          </button>

          {/* ৩: মেসেঞ্জার */}
          <Link
            to={user ? "/chat" : "/login?redirect=/chat"}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 relative ${
              isChatActive
                ? "bg-emerald-50 text-emerald-700 shadow-xs"
                : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>মেসেঞ্জার</span>
          </Link>

          {/* ৪: আমার বিজ্ঞাপন (লগইন থাকলে) */}
          {user && (
            <Link
              to="/my-properties"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                isMyPropsActive
                  ? "bg-emerald-50 text-emerald-700 shadow-xs"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
              }`}
            >
              <ListFilter className="w-4 h-4 text-gray-500" />
              <span>আমার বিজ্ঞাপন</span>
            </Link>
          )}

          {/* ৫: অ্যাডমিন (যদি অ্যাডমিন হয়) */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200 ${
                isAdminActive
                  ? "bg-black text-emerald-400 shadow-sm"
                  : "bg-gray-900 text-emerald-400 hover:bg-black shadow-xs hover:scale-102"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>অ্যাডমিন</span>
            </Link>
          )}
        </nav>

        {/* ইউজার লগইন / প্রোফাইল ও লগআউট */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {user.name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-bold text-gray-700 max-w-[110px] truncate">
                  {user.name || "ব্যবহারকারী"}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition duration-200 cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 px-4 py-2 rounded-xl transition duration-200 border border-gray-200/80"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>লগইন / রেজিস্টার</span>
            </Link>
          )}
        </div>

        {/* মোবাইল বাটনসমূহ */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={handlePostAdClick}
            className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>ভাড়া দিন</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-emerald-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            aria-label="মেনু খুলুন"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* মোবাইল ড্রয়ার মেনু (অ্যানিমেটেড রেসপনসিভ ড্রপডাউন) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-gray-200 shadow-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
            মেনু নেভিগেশন
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition ${
              isBrowseActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-emerald-600" />
              <span>বাড়ি খুঁজুন (সকল বিজ্ঞাপন)</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              ফিড
            </span>
          </Link>

          <button
            onClick={handlePostAdClick}
            className="w-full flex items-center justify-between p-3 rounded-2xl text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-white" />
              <span>বাড়ি ভাড়া দিন (নতুন পোস্ট)</span>
            </div>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">ফ্রি</span>
          </button>

          <Link
            to={user ? "/chat" : "/login?redirect=/chat"}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition ${
              isChatActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <span>মেসেঞ্জার ও চ্যাট</span>
            </div>
            <span className="text-xs text-gray-400">লাইভ</span>
          </Link>

          {user && (
            <Link
              to="/my-properties"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition ${
                isMyPropsActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <ListFilter className="w-5 h-5 text-gray-500" />
                <span>আমার বিজ্ঞাপনসমূহ</span>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl text-sm font-black bg-gray-900 text-emerald-400 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>অ্যাডমিন কন্ট্রোল প্যানেল</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </Link>
          )}

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{user.name}</div>
                    <div className="text-[11px] text-gray-400">{user.email || user.mobile}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:bg-red-50 p-2 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-sm transition"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>লগইন অথবা নতুন একাউন্ট</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
