import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, MapPin, Sparkles, Building2 } from 'lucide-react';
import api from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/properties');
        const list = res.data?.data?.properties || res.data?.properties || res.data?.data || [];
        setProperties(list);
      } catch (err) {
        console.warn('Property fetch warning:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      {/* হিরো ব্যানার */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white py-16 px-4 sm:px-8 rounded-3xl mx-4 mt-4 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
            <Sparkles className="w-4 h-4" />
            <span>বগুড়া শহরের একমাত্র ডিজিটাল টু-লেট প্ল্যাটফর্ম</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            সহজেই খুঁজুন আপনার স্বপ্নের বাসা অথবা ভাড়া দিন নিশ্চিন্তে
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
            জলেশ্বরীতলা, জলেশ্বরীতলা রোড, ঠনঠনিয়া, উপশহর কিংবা সূত্রাপুরে পরিবার বা ব্যাচেলর বাসা ভাড়া।
          </p>

          {/* বাড়িওয়ালাদের জন্য কল-টু-অ্যাকশন বাটন */}
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(user ? '/properties/create' : '/login?redirect=/properties/create')}
              className="flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>আপনার বাসা ভাড়া দিন (ফ্রি বিজ্ঞাপন)</span>
            </button>
          </div>
        </div>
      </div>

      {/* নতুন লিস্টিং সেকশন */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">সাম্প্রতিক বাসা ভাড়ার বিজ্ঞাপন</h2>
            <p className="text-xs text-gray-500 mt-1">সরাসরি বাড়িওয়ালার সাথে কথা বলুন কোনো দালাল ছাড়া</p>
          </div>
          <button
            onClick={() => navigate(user ? '/properties/create' : '/login?redirect=/properties/create')}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>+ বিজ্ঞাপন দিন</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">বিজ্ঞাপন লোড হচ্ছে...</div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">এখনও কোনো বিজ্ঞাপন প্রকাশ করা হয়নি</h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">প্রথম ব্যক্তি হিসেবে আপনার বাসা ভাড়ার বিজ্ঞাপন পোস্ট করুন।</p>
            <button
              onClick={() => navigate(user ? '/properties/create' : '/login?redirect=/properties/create')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>বিজ্ঞাপন পোস্ট করুন</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
