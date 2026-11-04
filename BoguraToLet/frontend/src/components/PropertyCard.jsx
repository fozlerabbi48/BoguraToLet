import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Heart,
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function PropertyCard({ property, onReactionUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reacted, setReacted] = useState(false);
  const [loveCount, setLoveCount] = useState(
    property?.social?.loveCount ?? property?.likesCount ?? 0
  );
  const [animateHeart, setAnimateHeart] = useState(false);
  const [chatStarting, setChatStarting] = useState(false);

  // লাইক বা লাভ রিঅ্যাকশন
  const handleLoveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("রিঅ্যাকশন দিতে প্রথমে আপনার একাউন্টে লগইন করুন!");
      navigate(`/login?redirect=/properties/${property._id}`);
      return;
    }

    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 500);

    const nextState = !reacted;
    setReacted(nextState);
    setLoveCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.post(`/social/properties/${property._id}/react`, {
        type: "Love",
      });
      if (onReactionUpdate) {
        onReactionUpdate(property._id, res);
      }
    } catch (err) {
      console.error("Reaction failed:", err.message);
    }
  };

  // মেসেঞ্জার / চ্যাটে সরাসরি কানেক্ট
  const handleMessengerConnect = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/login?redirect=/properties/${property._id}`);
      return;
    }

    const ownerId = property?.owner?._id || property?.owner?.id;
    if (user.id === ownerId || user._id === ownerId) {
      alert("এটি আপনার নিজেরই পোস্ট! অন্য কারো পোস্টে মেসেজ দিতে পারেন।");
      return;
    }

    if (!ownerId) {
      navigate(`/properties/${property._id}`);
      return;
    }

    try {
      setChatStarting(true);
      await api.post("/chat/conversations", {
        receiverId: ownerId,
        propertyId: property._id,
      });
      navigate("/chat");
    } catch (err) {
      navigate("/chat");
    } finally {
      setChatStarting(false);
    }
  };

  // ছবি সাপোর্ট
  const getImageUrl = () => {
    if (property?.images && property.images.length > 0) {
      const first = property.images[0];
      if (typeof first === "string" && first.trim()) return first;
      if (first && typeof first === "object") {
        if (first.url && typeof first.url === "string") return first.url;
        if (first.secure_url && typeof first.secure_url === "string") return first.secure_url;
      }
    }
    return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60";
  };

  const rentValue = Number(property.rent || property.rentAmount || 0);
  const categoryName = property.category || property.propertyType || "বাসা";
  const tenantName = property.tenantPreference || property.targetTenant || "ফ্যামিলি";
  const areaName = property.area?.name || "জলেশ্বরীতলা";
  const upazilaName = property.upazila?.name || "বগুড়া সদর";
  const commentCount = property.social?.commentCount ?? property.commentsCount ?? 0;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
      <div>
        <Link
          to={`/properties/${property._id}`}
          className="relative h-52 w-full overflow-hidden block bg-slate-100"
        >
          <img
            src={getImageUrl()}
            alt={property.title || "Property"}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60";
            }}
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-emerald-600/90 backdrop-blur-md text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-md">
              {categoryName}
            </span>
            {property.isFeatured && (
              <span className="bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> স্পেশাল
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 bg-gray-950/80 backdrop-blur-md text-white font-black text-sm px-3.5 py-1.5 rounded-xl shadow-lg border border-white/10">
            ৳ {rentValue.toLocaleString("bn-BD")}{" "}
            <span className="text-[11px] font-normal text-gray-300">/মাস</span>
          </div>

          {property.googleMapLocation && (
            <a
              href={property.googleMapLocation}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-emerald-700 p-2 rounded-full shadow-md hover:scale-110 transition duration-200"
              title="গুগল ম্যাপে অবস্থান দেখুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </Link>

        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {areaName}, {upazilaName}
            </span>
          </div>

          <Link to={`/properties/${property._id}`}>
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-emerald-600 transition duration-200 mb-2">
              {property.title || "আকর্ষণীয় বাসা ভাড়া"}
            </h3>
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-600 bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-100 my-2">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-emerald-600" />
              <span>{property.bedrooms || 1} বেড</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-teal-600" />
              <span>{property.bathrooms || 1} বাথ</span>
            </div>
            <div className="text-gray-300">|</div>
            <div className="text-xs text-gray-600 truncate">{tenantName}</div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
              {property.owner?.name?.charAt(0) || "ম"}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-800 truncate max-w-[110px]">
                {property.owner?.name || "বাড়িওয়ালা"}
              </span>
              {property.owner?.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" title="ভেরিফাইড মালিক" />
              )}
            </div>
          </div>

          {/* লাইক ও কমেন্ট বাটন */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoveClick}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-transform duration-200 cursor-pointer ${
                reacted
                  ? "text-red-500 font-bold bg-red-50"
                  : "text-gray-500 hover:text-red-500 hover:bg-gray-50"
              } ${animateHeart ? "scale-125" : ""}`}
              title="ভালোবাসা / রিঅ্যাক্ট দিন"
            >
              <Heart className={`w-4 h-4 ${reacted ? "fill-red-500 text-red-500" : ""}`} />
              <span className="text-xs">{loveCount}</span>
            </button>

            <Link
              to={`/properties/${property._id}#comments`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition duration-200"
              title="কমেন্ট ও মতামত দেখুন"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{commentCount}</span>
            </Link>
          </div>
        </div>

        {/* মেসেঞ্জারে কানেক্ট করার অ্যাকশন বাটন */}
        <div className="pt-3">
          <button
            onClick={handleMessengerConnect}
            disabled={chatStarting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2.5 px-4 rounded-xl font-black text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all duration-200 active:scale-98 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{chatStarting ? "কানেক্ট হচ্ছে..." : "মেসেঞ্জারে চ্যাট করুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
