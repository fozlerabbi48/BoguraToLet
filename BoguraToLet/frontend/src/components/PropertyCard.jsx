import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Heart, MessageCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PropertyCard({ property, onReactionUpdate }) {
  const { user } = useAuth();
  const [reacted, setReacted] = useState(false);
  const [loveCount, setLoveCount] = useState(property?.social?.loveCount || 0);

  const handleLoveClick = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('রিঅ্যাকশন দিতে প্রথমে লগইন করুন!');
      return;
    }
    try {
      const res = await api.post(`/social/reaction/${property._id}`, { type: 'love' });
      setReacted(!reacted);
      setLoveCount((prev) => (reacted ? Math.max(0, prev - 1) : prev + 1));
      if (onReactionUpdate) onReactionUpdate(property._id, res.data);
    } catch (err) {
      console.error('Reaction failed:', err.message);
    }
  };

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col group">
      <Link to={`/properties/${property._id}`} className="relative h-48 w-full overflow-hidden block bg-gray-100">
        <img
          src={images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow">
          {property.propertyType || 'বাসা'}
        </div>
        <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white font-extrabold text-sm px-3 py-1 rounded-lg">
          ৳ {Number(property.rentAmount || 0).toLocaleString()} <span className="text-xs font-normal">/মাস</span>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {property.area?.name || 'জলেশ্বরীতলা'}, {property.upazila?.name || 'বগুড়া সদর'}
            </span>
          </div>

          <Link to={`/properties/${property._id}`}>
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-emerald-600 transition mb-2">
              {property.title}
            </h3>
          </Link>

          <div className="flex items-center gap-4 text-xs text-gray-600 border-y border-gray-100 py-2 my-2">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-gray-400" />
              <span>{property.bedrooms || 0} বেড</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-gray-400" />
              <span>{property.bathrooms || 0} বাথ</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-xs text-gray-500 font-medium">
              {property.targetTenant || 'পরিবার'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {property.owner?.name?.charAt(0) || 'O'}
            </div>
            <span className="font-medium text-gray-700 truncate max-w-[100px]">
              {property.owner?.name || 'মালিক'}
            </span>
            {property.owner?.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" title="ভেরিফাইড মালিক" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoveClick}
              className={`flex items-center gap-1 hover:text-red-500 transition ${
                reacted ? 'text-red-500 font-bold' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${reacted ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{loveCount}</span>
            </button>

            <Link
              to={`/properties/${property._id}`}
              className="flex items-center gap-1 hover:text-emerald-600 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{property.social?.commentCount || 0}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
