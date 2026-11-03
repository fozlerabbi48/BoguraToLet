import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Loader2, ImagePlus, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// রেসপন্স যেভাবেই আসুক ({data:[...]} বা {data:{data:[...]}}) অ্যারে বের করে আনে
const unwrapList = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const MAX_IMAGES = 8;
const MAX_SIZE_MB = 5;

export default function CreateProperty() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // লোকেশন
  const [divisionId, setDivisionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [upazilas, setUpazilas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);

  // ছবি
  const [images, setImages] = useState([]); // { file, preview }
  const imagesRef = useRef([]);

  // ফর্ম স্টেট
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Family House',
    tenantPreference: 'Any',
    rent: '',
    advancePayment: '',
    securityDeposit: '',
    contactPhone: user?.phone || '',
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    floorNo: 2,
    totalFloors: 5,
    isFurnished: false,
    hasParking: false,
    addressDetails: '',
    availableFrom: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ইউজার পরে লোড হলে ফোন নম্বর বসিয়ে দেবে (ইউজার নিজে না লিখে থাকলে)
  useEffect(() => {
    if (user?.phone) {
      setFormData((prev) => (prev.contactPhone ? prev : { ...prev, contactPhone: user.phone }));
    }
  }, [user]);

  // বগুড়া জেলা ও তার উপজেলা লোড
  useEffect(() => {
    const init = async () => {
      try {
        const distRes = await api.get('/locations/districts');
        const dists = unwrapList(distRes);
        const bogura =
          dists.find(
            (d) =>
              d.name?.toLowerCase().includes('bogura') ||
              d.name?.toLowerCase().includes('bogra') ||
              d.bnName?.includes('বগুড়া')
          ) || null;

        if (!bogura) {
          setError('বগুড়া জেলা পাওয়া যায়নি। লোকেশন ডাটা সিড করা আছে কিনা দেখুন।');
          return;
        }

        setDistrictId(bogura._id);
        setDivisionId(typeof bogura.division === 'object' ? bogura.division?._id : bogura.division);

        const upaRes = await api.get(`/locations/upazilas?districtId=${bogura._id}`);
        const upaList = unwrapList(upaRes);
        setUpazilas(upaList);
        if (upaList.length > 0) setSelectedUpazila(upaList[0]._id);
      } catch (err) {
        console.error('Location initialization failed:', err);
        setError('লোকেশন লোড করা যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
      } finally {
        setLocationLoading(false);
      }
    };
    init();
  }, []);

  // উপজেলা অনুযায়ী এলাকা লোড
  useEffect(() => {
    if (!selectedUpazila) return;
    let cancelled = false;
    setAreas([]);
    setSelectedArea('');

    const fetchAreas = async () => {
      try {
        const res = await api.get(`/locations/areas?upazilaId=${selectedUpazila}`);
        if (cancelled) return;
        const areaList = unwrapList(res);
        setAreas(areaList);
        setSelectedArea(areaList.length > 0 ? areaList[0]._id : '');
      } catch (err) {
        console.error('Area fetch failed:', err);
      }
    };
    fetchAreas();
    return () => {
      cancelled = true;
    };
  }, [selectedUpazila]);

  // কম্পোনেন্ট বন্ধ হলে ছবির প্রিভিউ URL মুক্ত করা
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => {
    return () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImagePick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    setError('');

    const valid = [];
    for (const file of picked) {
      if (!file.type.startsWith('image/')) {
        setError('শুধু ছবির ফাইল দেওয়া যাবে।');
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`প্রতিটি ছবি সর্বোচ্চ ${MAX_SIZE_MB}MB হতে পারবে।`);
        continue;
      }
      valid.push({ file, preview: URL.createObjectURL(file) });
    }

    setImages((prev) => {
      const merged = [...prev, ...valid];
      if (merged.length > MAX_IMAGES) {
        merged.slice(MAX_IMAGES).forEach((i) => URL.revokeObjectURL(i.preview));
        setError(`সর্বোচ্চ ${MAX_IMAGES}টি ছবি দেওয়া যাবে।`);
        return merged.slice(0, MAX_IMAGES);
      }
      return merged;
    });
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError('বিজ্ঞাপন দিতে অনুগ্রহ করে প্রথমে লগইন করুন!');
    if (!formData.addressDetails.trim()) {
      return setError('সুনির্দিষ্ট ঠিকানা বা রোডের নাম দিন!');
    }
    if (!districtId || !selectedUpazila || !selectedArea) {
      return setError('উপজেলা ও এলাকা নির্বাচন করুন!');
    }
    if (!/^01[3-9]\d{8}$/.test(formData.contactPhone.trim())) {
      return setError('সঠিক ফোন নম্বর দিন (উদা: 01712345678)।');
    }

    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('category', formData.category);
      fd.append('tenantPreference', formData.tenantPreference);
      fd.append('rent', formData.rent);
      fd.append('advancePayment', formData.advancePayment || 0);
      fd.append('securityDeposit', formData.securityDeposit || 0);
      fd.append('contactPhone', formData.contactPhone.trim());
      fd.append('bedrooms', formData.bedrooms);
      fd.append('bathrooms', formData.bathrooms);
      fd.append('balconies', formData.balconies);
      fd.append('floorNo', formData.floorNo);
      fd.append('totalFloors', formData.totalFloors);
      fd.append('isFurnished', formData.isFurnished ? 'true' : 'false');
      fd.append('hasParking', formData.hasParking ? 'true' : 'false');
      fd.append('addressDetails', formData.addressDetails.trim());
      fd.append('availableFrom', formData.availableFrom);
      fd.append('division', divisionId);
      fd.append('district', districtId);
      fd.append('upazila', selectedUpazila);
      fd.append('area', selectedArea);
      // ছবি না দিলে ব্যাকএন্ড নিজেই ডিফল্ট কভার বসিয়ে দেয়
      images.forEach((img) => fd.append('images', img.file));

      const res = await api.post('/properties', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newId = res.data?.data?._id || res.data?._id;
      alert('অভিনন্দন! আপনার বাসা ভাড়ার বিজ্ঞাপনটি সফলভাবে প্রকাশিত হয়েছে।');
      navigate(newId ? `/properties/${newId}` : '/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'বিজ্ঞাপন পোস্ট করতে সমস্যা হয়েছে!');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 text-sm font-medium';
  const smallInputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600 mb-6 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ফিরে যান</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-md">
        <div className="border-b border-gray-100 pb-5 mb-8">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">
            বাড়িওয়ালা / বিজ্ঞাপনদাতা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            বাসা ভাড়ার ফ্রি বিজ্ঞাপন দিন
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            বগুড়ার হাজারো সম্ভাব্য ভাড়াটিয়ার কাছে আপনার বাসার তথ্য পৌঁছে দিন।
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* শিরোনাম */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              বিজ্ঞাপনের শিরোনাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="উদা: জলেশ্বরীতলায় ৩ রুমের নিরিবিলি ফ্যামিলি ফ্ল্যাট ভাড়া হবে"
              className={inputCls}
            />
          </div>

          {/* লোকেশন */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                উপজেলা <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUpazila}
                onChange={(e) => setSelectedUpazila(e.target.value)}
                disabled={locationLoading}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none"
              >
                {locationLoading && <option>লোড হচ্ছে...</option>}
                {upazilas.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.bnName || u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                এলাকা / মহল্লা <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                disabled={areas.length === 0}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none"
              >
                {areas.length === 0 && <option value="">এলাকা পাওয়া যায়নি</option>}
                {areas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.bnName || a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                সুনির্দিষ্ট ঠিকানা বা রোডের নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="addressDetails"
                required
                value={formData.addressDetails}
                onChange={handleChange}
                placeholder="উদা: বাড়ি নং ১২, রোড ৩, জলেশ্বরীতলা (মেইন রোডের কাছে)"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          {/* ভাড়া, ক্যাটাগরি ও ফোন */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">
                মাসিক ভাড়া (টাকা) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="rent"
                required
                min="0"
                value={formData.rent}
                onChange={handleChange}
                placeholder="12000"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">
                ক্যাটাগরি <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${inputCls} bg-white`}
              >
                <option value="Family House">Family House (পরিবার)</option>
                <option value="Flat Rent">Flat Rent (ফ্ল্যাট)</option>
                <option value="Bachelor Room">Bachelor Room (ব্যাচেলর)</option>
                <option value="Sublet">Sublet (সাবলেট)</option>
                <option value="Hostel / Mess">Hostel / Mess (মেস)</option>
                <option value="Shop Rent">Shop Rent (দোকান)</option>
                <option value="Office Rent">Office Rent (অফিস)</option>
                <option value="Commercial Space">Commercial Space (বাণিজ্যিক)</option>
                <option value="Other Rental Properties">Other Rental (অন্যান্য)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">
                যোগাযোগের ফোন নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="01712345678"
                className={inputCls}
              />
            </div>
          </div>

          {/* অগ্রিম ও জামানত */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">অগ্রিম (টাকা)</label>
              <input
                type="number"
                name="advancePayment"
                min="0"
                value={formData.advancePayment}
                onChange={handleChange}
                placeholder="0"
                className={smallInputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">জামানত (টাকা)</label>
              <input
                type="number"
                name="securityDeposit"
                min="0"
                value={formData.securityDeposit}
                onChange={handleChange}
                placeholder="0"
                className={smallInputCls}
              />
            </div>
          </div>

          {/* রুম ও ফ্লোর */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              ['bedrooms', 'বেডরুম'],
              ['bathrooms', 'বাথরুম'],
              ['balconies', 'বারান্দা'],
              ['floorNo', 'কত তলা'],
              ['totalFloors', 'মোট তলা'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">{label}</label>
                <input
                  type="number"
                  name={name}
                  min="0"
                  value={formData[name]}
                  onChange={handleChange}
                  className={smallInputCls}
                />
              </div>
            ))}
          </div>

          {/* সুবিধা */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="isFurnished"
                checked={formData.isFurnished}
                onChange={handleChange}
                className="w-4 h-4 accent-emerald-600"
              />
              ফার্নিশড
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="hasParking"
                checked={formData.hasParking}
                onChange={handleChange}
                className="w-4 h-4 accent-emerald-600"
              />
              পার্কিং আছে
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              কবে থেকে খালি হবে <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="availableFrom"
              required
              value={formData.availableFrom}
              onChange={handleChange}
              className={smallInputCls}
            />
          </div>

          {/* বিবরণ */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              বিস্তারিত বিবরণ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="গ্যাস, পানি, বিদ্যুৎ, বারান্দা, লিফট, পার্কিং ও অন্যান্য সুযোগ-সুবিধার বিবরণ দিন..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 text-sm"
            />
          </div>

          {/* ছবি */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              ছবি (সর্বোচ্চ {MAX_IMAGES}টি, প্রথমটি কভার হবে)
            </label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={img.preview} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[10px] font-bold text-center py-0.5">
                      কভার
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5"
                    title="মুছুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 hover:border-emerald-600 hover:text-emerald-600 text-gray-400 rounded-xl cursor-pointer transition">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-[11px] font-bold">ছবি দিন</span>
                  <input type="file" accept="image/*" multiple onChange={handleImagePick} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">ছবি না দিলে একটি ডিফল্ট ছবি বসবে।</p>
          </div>

          <button
            type="submit"
            disabled={loading || locationLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 transition text-base flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>বিজ্ঞাপন প্রকাশিত হচ্ছে...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>বিজ্ঞাপনটি প্রকাশ করুন</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}