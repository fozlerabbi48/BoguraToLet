import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Phone, ArrowRight, ShieldCheck, Home, Sparkles, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // ইমেইল নাকি মোবাইল শনাক্তকরণ
  const cleanInput = identifier.trim();
  const isEmail = cleanInput.includes('@');
  const isPhone = /^[0-9+]+$/.test(cleanInput);

  // ভ্যালিডেশন লজিক
  const validateInput = (value) => {
    const val = value.trim();
    if (!val) return 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন!';
    
    // ইমেইল হলে ফরম্যাট চেক
    if (val.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return 'সঠিক ইমেইল ঠিকানা দিন (যেমন: user@example.com)';
      }
      return null;
    }

    // মোবাইল নম্বর হলে বাংলাদেশী ১১ ডিজিটের ফরম্যাট চেক
    const normalizedPhone = val.replace(/^(\+880|880)/, '0');
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      return 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateInput(identifier);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!password) {
      setError('পাসওয়ার্ড প্রদান করুন!');
      return;
    }

    setLoading(true);

    try {
      // ফোন হলে নরমালাইজ করে 01xxxxxxxxx পাঠানো
      let loginData = cleanInput;
      if (!isEmail && /^[0-9+]+$/.test(cleanInput)) {
        loginData = cleanInput.replace(/^(\+880|880)/, '0');
      }

      await login(loginData, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে! ইমেইল/মোবাইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900">
      {/* রঙিন অ্যানিমেটেড ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট এফেক্ট */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-600/30 to-teal-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-bl from-cyan-600/30 via-indigo-600/25 to-pink-500/20 rounded-full blur-[130px] animate-pulse [animation-duration:8s]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* লোগো ও হেডার ব্যাজ */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 backdrop-blur-md mb-4 text-emerald-300 text-xs font-semibold tracking-wide shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin [animation-duration:6s]" />
            <span>বগুড়া শহরের বিশ্বস্ত টু-লেট প্ল্যাটফর্ম</span>
          </div>

          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl shadow-lg shadow-emerald-500/30">
              <Home className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
              BoguraToLet
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            মোবাইল নম্বর অথবা ইমেইল দিয়ে সহজে লগইন করুন
          </p>
        </div>

        {/* গ্লাস-মরফিজম লগইন কার্ড */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 p-8 rounded-3xl shadow-2xl shadow-black/50 hover:border-emerald-500/50 transition-all duration-500">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* মোবাইল বা ইমেইল ইনপুট */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                ইমেইল অথবা মোবাইল নম্বর
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                  {isPhone ? (
                    <Phone className="w-5 h-5 text-emerald-400 animate-bounce" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                </div>
                <input
                  type="text"
                  name="identifier"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/70 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                  placeholder="01712345678 অথবা user@gmail.com"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>যেকোনো ১১ ডিজিটের মোবাইল অথবা ইমেইল গ্রহণযোগ্য</span>
              </p>
            </div>

            {/* পাসওয়ার্ড ইনপুট উইথ Eye টগল */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  পাসওয়ার্ড
                </label>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-11 pr-11 py-3 bg-slate-900/70 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-emerald-300 transition-all p-1 rounded-lg hover:bg-slate-700/50 focus:outline-none"
                  tabIndex="-1"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-emerald-400 transition-transform scale-110" />
                  ) : (
                    <Eye className="w-5 h-5 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* রঙিন গ্রেডিয়েন্ট সাবমিট বাটন */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden py-3.5 px-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>লগইন করুন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* রেজিস্ট্রেশন লিংক */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400">
              অ্যাকাউন্ট নেই?{' '}
              <Link
                to="/register"
                className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/40 hover:decoration-emerald-400 transition-all"
              >
                নতুন অ্যাকাউন্ট তৈরি করুন
              </Link>
            </p>
          </div>
        </div>

        {/* সিকিউরিটি ব্যাজ */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>১০০% নিরাপদ ও সুরক্ষিত ডেটা এনক্রিপশন</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
