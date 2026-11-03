import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, Trash2, CheckCircle2, AlertCircle, Building2, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function MyProperties() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAds = async () => {
    try {
      const res = await api.get('/properties/my/listings');
      setProperties(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load my properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'rented' ? 'active' : 'rented';
    try {
      await api.patch(`/properties/${id}/status`, { status: nextStatus });
      fetchMyAds();
    } catch (err) {
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p._id !== id));
      alert('বিজ্ঞাপনটি মুছে ফেলা হয়েছে।');
    } catch (err) {
      alert('বিজ্ঞাপন মুছতে সমস্যা হয়েছে!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">আমার বিজ্ঞাপনের ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-500 mt-1">আপনার প্রকাশিত বাসা ভাড়ার বিজ্ঞাপনসমূহ পরিচালনা করুন</p>
        </div>
        <Link
          to="/properties/create"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md transition text-sm"
        >
          <PlusCircle className="w-5 h-5" />
          <span>নতুন বিজ্ঞাপন দিন</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">বিজ্ঞাপন লোড হচ্ছে...</div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">আপনার কোনো সক্রিয় বিজ্ঞাপন নেই</h3>
          <p className="text-xs text-gray-400 mt-1 mb-6">এখনই আপনার বাসা বা মেসের বিজ্ঞাপন পোস্ট করুন।</p>
          <Link
            to="/properties/create"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>বিজ্ঞাপন পোস্ট করুন</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((p) => (
            <div key={p._id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    p.status === 'rented'
                      ? 'bg-amber-100 text-amber-700'
                      : p.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {p.status === 'rented' ? 'ভাড়া সম্পন্ন' : p.status === 'active' ? 'চলমান' : p.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{p.viewCount || 0} বার দেখা হয়েছে</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-gray-900 text-base mt-3 line-clamp-1">
                  {p.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{p.area?.name || 'বগুড়া'}, {p.addressDetails}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline justify-between">
                  <span className="text-xs text-gray-400 font-medium">মাসিক ভাড়া</span>
                  <span className="text-base font-black text-emerald-700">৳{p.rent?.toLocaleString('bn-BD')}</span>
                </div>
              </div>

              {/* অ্যাকশন বাটনসমূহ */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(p._id, p.status)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    p.status === 'rented'
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{p.status === 'rented' ? 'পুনরায় চালু করুন' : 'ভাড়া হয়েছে চিহ্নিত করুন'}</span>
                </button>

                <button
                  onClick={() => handleDelete(p._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                  title="বিজ্ঞাপন মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
