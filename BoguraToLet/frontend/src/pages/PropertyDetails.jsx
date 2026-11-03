import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Layers, Calendar, Heart, Bookmark, MessageSquare, Send, CheckCircle2, User, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // কমেন্ট ও রিপ্লাই ইনপুট স্টেট
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  // রিঅ্যাকশন স্টেট
  const [loveCount, setLoveCount] = useState(0);
  const [hasLoved, setHasLoved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // ডেটা ফেচিং
  const fetchDetails = async () => {
    setLoading(true);
    try {
      const propRes = await api.get(`/properties/${id}`);
      const propData = propRes.data?.property || propRes.data;
      setProperty(propData);
      setLoveCount(propData.social?.loveCount || 0);

      // কমেন্ট ফেচিং
      try {
        const commRes = await api.get(`/social/comments/${id}`);
        setComments(commRes.data?.comments || commRes.data || []);
      } catch (e) {
        console.warn('Comments fetch failed:', e.message);
      }
    } catch (err) {
      setError(err.message || 'বিজ্ঞাপনের বিস্তারিত লোড করতে সমস্যা হয়েছে!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // লাভ রিঅ্যাকশন হ্যান্ডলার
  const handleLove = async () => {
    if (!user) return alert('রিঅ্যাকশন দিতে লগইন করুন!');
    try {
      await api.post(`/social/reaction/${id}`, { type: 'love' });
      setHasLoved(!hasLoved);
      setLoveCount((prev) => (hasLoved ? Math.max(0, prev - 1) : prev + 1));
    } catch (err) {
      alert(err.message);
    }
  };

  // বুকমার্ক হ্যান্ডলার
  const handleBookmark = async () => {
    if (!user) return alert('বুকমার্ক করতে লগইন করুন!');
    try {
      await api.post(`/social/bookmark/${id}`);
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      alert(err.message);
    }
  };

  // কমেন্ট সাবমিট
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('কমেন্ট করতে লগইন করুন!');
    if (!newComment.trim()) return;

    try {
      const res = await api.post(`/social/comment/${id}`, { text: newComment });
      const addedComment = res.data?.comment || res.data;
      setComments([addedComment, ...comments]);
      setNewComment('');
    } catch (err) {
      alert(err.message);
    }
  };

  // রিপ্লাই সাবমিট
  const handleReplySubmit = async (commentId) => {
    if (!user) return alert('রিপ্লাই দিতে লগইন করুন!');
    const text = replyText[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/social/comment/${id}/reply/${commentId}`, { text });
      const updated = res.data?.comment || res.data;
      setComments(comments.map((c) => (c._id === commentId ? updated : c)));
      setReplyText({ ...replyText, [commentId]: '' });
      setActiveReplyId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // ওনারের সাথে চ্যাট শুরু
  const handleStartChat = async () => {
    if (!user) return alert('মেসেজ দিতে লগইন করুন!');
    if (user.id === property?.owner?._id) return alert('এটি আপনার নিজেরই বিজ্ঞাপন!');

    try {
      const res = await api.post('/chat/conversations', {
        receiverId: property.owner._id,
        propertyId: property._id,
      });
      navigate('/chat');
    } catch (err) {
      // কনভারসেশন আগেই থাকলে চ্যাট পেজে চলে যাওয়া
      navigate('/chat');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm">বিজ্ঞাপনের তথ্য আসছে...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600 mb-4">{error || 'বিজ্ঞাপনটি পাওয়া যায়নি!'}</p>
        <button onClick={() => navigate('/')} className="text-emerald-600 font-semibold hover:underline">
          হোমে ফিরে যান
        </button>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ব্যাক বাটন */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600 mb-6 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ফিরে যান</span>
      </button>

      {/* টাইটেল ও লোকেশন */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {property.propertyType || 'বাসা'}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
            {property.title}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {property.address || property.area?.name}, {property.upazila?.name}, বগুড়া
            </span>
          </div>
        </div>

        <div className="text-left md:text-right bg-emerald-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
          <p className="text-xs text-gray-500">মাসিক ভাড়া</p>
          <p className="text-3xl font-black text-emerald-600">
            ৳ {Number(property.rentAmount || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{property.isNegotiable ? '(আলোচনা সাপেক্ষে)' : '(ফিক্সড)'}</p>
        </div>
      </div>

      {/* ইমেজ গ্যালারি */}
      <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-md mb-8 max-h-[460px] bg-gray-100">
        <img
          src={images[0]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* গ্রিড লেআউট: বিস্তারিত এবং ওনার সাইডবার */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* মূল কনটেন্ট (২ কলাম) */}
        <div className="lg:col-span-2 space-y-8">
          {/* বেসিক স্পেক্স */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="p-3 bg-gray-50 rounded-xl">
              <Bed className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">বেডরুম</p>
              <p className="font-bold text-gray-900">{property.bedrooms || 0}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Bath className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">বাথরুম</p>
              <p className="font-bold text-gray-900">{property.bathrooms || 0}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Layers className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">ফ্লোর / তলা</p>
              <p className="font-bold text-gray-900">{property.floorNo || '১ম'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">ভাড়া দেওয়া হবে</p>
              <p className="font-bold text-gray-900">{property.availableFrom || 'চলতি মাস'}</p>
            </div>
          </div>

          {/* বিবরণ */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">বিস্তারিত বিবরণ</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
              {property.description || 'কোনো বিবরণ যোগ করা হয়নি।'}
            </p>
          </div>

          {/* সোশ্যাল অ্যাকশন বার */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLove}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  hasLoved ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLoved ? 'fill-red-600' : ''}`} />
                <span>পছন্দ ({loveCount})</span>
              </button>

              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  isBookmarked ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-emerald-600' : ''}`} />
                <span>{isBookmarked ? 'সংরক্ষিত' : 'বুকমার্ক'}</span>
              </button>
            </div>
          </div>

          {/* কমেন্ট সেকশন */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>প্রশ্ন ও মতামত ({comments.length})</span>
            </h2>

            {/* কমেন্ট লেখার ফর্ম */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="বাসাটি সম্পর্কে প্রশ্ন করুন..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1 shadow transition"
              >
                <Send className="w-4 h-4" />
                <span>পাঠান</span>
              </button>
            </form>

            {/* কমেন্ট লিস্ট */}
            <div className="space-y-4 pt-2">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">এখনো কোনো প্রশ্ন আসেনি। আপনার প্রশ্নটি করুন!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {comment.user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-gray-800">{comment.user?.name || 'ব্যবহারকারী'}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <p className="text-gray-700 pl-9">{comment.text}</p>

                    {/* রিপ্লাই বাটন */}
                    <div className="pl-9 pt-1">
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                        className="text-xs text-emerald-600 font-semibold hover:underline"
                      >
                        উত্তর দিন
                      </button>
                    </div>

                    {/* রিপ্লাই ইনপুট ফর্ম */}
                    {activeReplyId === comment._id && (
                      <div className="pl-9 pt-2 flex gap-2">
                        <input
                          type="text"
                          value={replyText[comment._id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [comment._id]: e.target.value })}
                          placeholder="উত্তর লিখুন..."
                          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none"
                        />
                        <button
                          onClick={() => handleReplySubmit(comment._id)}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          রিপ্লাই
                        </button>
                      </div>
                    )}

                    {/* নেস্টেড রিপ্লাইসমূহ */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="pl-9 pt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="p-2.5 bg-white rounded-lg border border-gray-100 text-xs">
                            <span className="font-bold text-gray-800 mr-2">{reply.user?.name || 'উত্তরদাতা'}:</span>
                            <span className="text-gray-600">{reply.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ওনার ও যোগাযোগ সাইডবার (১ কলাম) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
              বিজ্ঞাপনদাতার তথ্য
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                {property.owner?.name?.charAt(0) || 'O'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-gray-900">{property.owner?.name || 'মালিক'}</h4>
                  {property.owner?.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500" title="ভেরিফাইড মালিক" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{property.owner?.phone || 'ফোন নম্বর সংরক্ষিত'}</p>
              </div>
            </div>

            <button
              onClick={handleStartChat}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>সরাসরি মেসেজ পাঠান</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
