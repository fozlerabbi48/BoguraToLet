
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  PlusCircle,
  MessageSquare,
  ListFilter,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login না করলে Navbar দেখাবে না
  if (!user) return null;

  const isAdmin = ["Super Admin", "Admin", "Moderator"].includes(user.role);

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
    transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
    ${
      isActive(path)
        ? "bg-white text-emerald-800 shadow-md"
        : "text-white hover:bg-emerald-600"
    }`;

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 animate-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
        >
          <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:rotate-6">
            <Home className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xl sm:text-2xl font-black tracking-tight block leading-tight">
              BoguraToLet
            </span>
            <span className="text-[10px] text-emerald-100 font-semibold tracking-wider">
              বগুড়ার টু-লেট পোর্টাল
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">

          <Link to="/" className={linkClass("/")}>
            <Search size={17} />
            বাড়ি খুঁজুন
          </Link>

          <Link
            to="/create-property"
            className={linkClass("/create-property")}
          >
            <PlusCircle size={17} />
            বাড়ি ভাড়া দিন
          </Link>

          <Link to="/chat" className={linkClass("/chat")}>
            <MessageSquare size={17} />
            মেসেঞ্জার
          </Link>

          <Link
            to="/my-properties"
            className={linkClass("/my-properties")}
          >
            <ListFilter size={17} />
            আমার বিজ্ঞাপন
          </Link>

          {isAdmin && (
            <Link to="/admin" className={linkClass("/admin")}>
              <ShieldCheck size={17} />
              অ্যাডমিন
            </Link>
          )}
        </nav>

        {/* Desktop User Profile */}
        <div className="hidden md:flex items-center gap-3">

          <div className="flex items-center gap-2 bg-emerald-800/60 px-3 py-2 rounded-xl border border-emerald-500/40">
            <div className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black">
              {user.name?.charAt(0) || "U"}
            </div>

            <span className="text-sm font-bold max-w-[100px] truncate">
              {user.name || "ব্যবহারকারী"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="লগআউট"
            className="p-2.5 rounded-xl bg-emerald-800 hover:bg-white hover:text-emerald-800 transition-all duration-300 hover:scale-105"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-emerald-800 hover:bg-white hover:text-emerald-800 transition-all duration-300"
          aria-label="মেনু খুলুন"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-800 border-t border-emerald-600 px-4 py-4 space-y-2 mobile-menu-animation">

          <Link to="/" onClick={closeMenu} className={linkClass("/")}>
            <Search size={18} />
            বাড়ি খুঁজুন
          </Link>

          <Link
            to="/create-property"
            onClick={closeMenu}
            className={linkClass("/create-property")}
          >
            <PlusCircle size={18} />
            বাড়ি ভাড়া দিন
          </Link>

          <Link
            to="/chat"
            onClick={closeMenu}
            className={linkClass("/chat")}
          >
            <MessageSquare size={18} />
            মেসেঞ্জার
          </Link>

          <Link
            to="/my-properties"
            onClick={closeMenu}
            className={linkClass("/my-properties")}
          >
            <ListFilter size={18} />
            আমার বিজ্ঞাপন
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={closeMenu}
              className={linkClass("/admin")}
            >
              <ShieldCheck size={18} />
              অ্যাডমিন
            </Link>
          )}

          <div className="border-t border-emerald-600 pt-3 mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={19} />
              <span className="text-sm font-bold">
                {user.name || "ব্যবহারকারী"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-emerald-800 px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all duration-300"
            >
              <LogOut size={16} />
              লগআউট
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
