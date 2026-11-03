import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, Mail, Lock, Shield, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'tenant', // ডিফল্ট ভাড়াটিয়া (tenant) অথবা বাড়ির মালিক (landlord)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // মোবাইল নম্বর ভ্যালিডেশন (বাংলাদেশি ১১ ডিজিট)
  const validatePhone = (phone) => {
    const bdRegex = /^01[3-9]\d{8}$/;
    return bdRegex.test(phone.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ১. নাম চেক
    if (formData.name.trim().length < 3) {
      return setError('আপনার পুরো নাম লিখুন (কমপক্ষে ৩ অক্ষর)।');
    }

    // ২. ফোন নম্বর চেক
    if (!validatePhone(formData.phone)) {
      return setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
    }

    // ৩. পাসওয়ার্ড চেক
    if (formData.password.length < 6) {
      return setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    }

    setLoading(true);

    try {
      // ব্যাকএন্ডে রেজিস্ট্রেশন রিকোয়েস্ট
      const res = await api.post('/auth/register', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() ? formData.email.trim() : undefined,
        password: formData.password,
        role: formData.role,
      });

      // রেজিস্ট্রেশন সফল হলে অটো-লগইন অথবা লগইন পেজে রিডাইরেক্ট
      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;

      if (token && user) {
        localStorage.setItem('token', token);
        if (login) login(user, token);
        alert('রেজিস্ট্রেশন সফল হয়েছে!');
        navigate('/');
      } else {
        alert('রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।');
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। এই নম্বর বা ইমেইল ইতিমধ্যে ব্যবহৃত হতে পারে।';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          নতুন একাউন্ট খুলুন
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          বগুড়া টু-লেট প্ল্যাটফর্মে বাসা খুঁজতে বা ভাড়া দিতে নিবন্ধন করুন
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">আপনার নাম *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                required
                placeholder="যেমন: মো: আরিফুল ইসলাম"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর (ভেরিফিকেশনের জন্য) *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="tel"
                required
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                required
                placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">আপনি কি হিসেবে একাউন্ট খুলতে চান?</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'tenant' })}
                className={`py-2 px-3 text-sm font-medium rounded-xl border text-center transition ${
                  formData.role === 'tenant'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                ভাড়াটিয়া (Tenant)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'landlord' })}
                className={`py-2 px-3 text-sm font-medium rounded-xl border text-center transition ${
                  formData.role === 'landlord'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                বাড়ির মালিক (Owner)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition mt-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'একাউন্ট তৈরি করুন'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ইতিমধ্যে একাউন্ট আছে?{' '}
          <Link to="/login" className="text-emerald-600 hover:underline font-semibold">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
