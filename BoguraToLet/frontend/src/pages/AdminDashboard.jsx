import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, Check, X, Trash2, Users, FileText, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const isAdmin = user && ['Super Admin', 'Admin', 'Moderator'].includes(user.role);

  const fetchAdminProperties = async () => {
    try {
      const url = filter === 'all' ? '/properties/admin/all' : `/properties/admin/all?status=${filter}`;
      const res = await api.get(url);
      setProperties(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchAdminProperties();
  }, [filter, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-red-50 text-center rounded-3xl border border-red-200">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-red-700">অননুমোদিত প্রবেশাধিকার</h2>
        <p className="text-sm text-red-600 mt-1 mb-6">এই প্যানেলে শুধুমাত্র অ্যাডমিন এবং সুপার অ্যাডমিনগণ প্রবেশ করতে পারবেন।</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/properties/${id}/status`, { status });
      fetchAdminProperties();
    } catch (err) {
      alert('স্ট্যাটাস পরিবর্তন করা যায়নি!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('অ্যাডমিন হিসেবে আপনি কি এই বিজ্ঞাপনটি পার্মানেন্ট মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert('বিজ্ঞাপন ডিলিট করতে ব্যর্থ হয়েছে!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* অ্যাডমিন হেডার ও স্ট্যাটস */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>BoguraToLet Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            বিজ্ঞাপন অনুমোদন, ব্যবহারকারী ভেরিফিকেশন এবং সার্বিক মডারেশন
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">মোট লিস্টিং</span>
            <span className="text-2xl font-black text-white">{properties.length}</span>
          </div>
        </div>
      </div>

      {/* ফিল্টার ট্যাব */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
        {['all', 'active', 'pending', 'rented'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition cursor-pointer ${
              filter === status
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'সকল বিজ্ঞাপন' : status === 'active' ? 'অনুমোদিত / সক্রিয়' : status === 'pending' ? 'অপেক্ষারত' : 'ভাড়া সম্পন্ন'}
          </button>
        ))}
      </div>

      {/* বিজ্ঞাপনের তালিকা টেবিল */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">বিজ্ঞাপন লোড হচ্ছে...</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">কোনো বিজ্ঞাপন পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6">বিজ্ঞাপনের শিরোনাম</th>
                  <th className="py-4 px-6">মালিক / ফোন</th>
                  <th className="py-4 px-6">ভাড়া</th>
                  <th className="py-4 px-6">বর্তমান স্ট্যাটাস</th>
                  <th className="py-4 px-6 text-right">অ্যাডমিন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {properties.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">{p.addressDetails}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900">{p.owner?.name || 'অজ্ঞাত'}</p>
                      <p className="text-gray-500 text-[11px]">{p.contactPhone || p.owner?.phone}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-700">
                      ৳{p.rent?.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        p.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : p.status === 'rented'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status !== 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(p._id, 'active')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            title="অনুমোদন করুন"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(p._id, 'rejected')}
                            className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                            title="বাতিল করুন"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition"
                          title="পার্মানেন্ট মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
