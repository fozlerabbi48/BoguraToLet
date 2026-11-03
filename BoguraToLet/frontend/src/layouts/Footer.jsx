import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* ব্র্যান্ড পরিচিতি */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="BoguraToLet"
              className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-900/40"
            />
            <span className="font-black text-2xl text-white tracking-tight">
              Bogura<span className="text-emerald-400">ToLet</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            বগুড়া শহরের প্রতিটি পাড়া-মহল্লায় নিরাপদ ও মধ্যস্বত্বভোগীহীন বাসা খোঁজার বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম।
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-2 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>ভেরিফাইড ওনার ও নিরাপদ চুক্তি</span>
          </div>
        </div>

        {/* জনপ্রিয় এলাকা */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
            জনপ্রিয় এলাকাসমূহ
          </h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-emerald-400 cursor-pointer transition">জলেশ্বরীতলা ও কালিতলা</span></li>
            <li><span className="hover:text-emerald-400 cursor-pointer transition">উপশহর ও ফুলবাড়ি</span></li>
            <li><span className="hover:text-emerald-400 cursor-pointer transition">সাতমাথা ও থানা মোড়</span></li>
            <li><span className="hover:text-emerald-400 cursor-pointer transition">বনানী ও কলোনি</span></li>
            <li><span className="hover:text-emerald-400 cursor-pointer transition">মালতীনগর ও কাটনারপাড়া</span></li>
          </ul>
        </div>

        {/* দরকারি লিংক */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
            প্রয়োজনীয় লিংক
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-400 transition">সকল বিজ্ঞাপন</Link></li>
            <li><Link to="/properties/create" className="hover:text-emerald-400 transition">বিজ্ঞাপন দিন</Link></li>
            <li><Link to="/my-properties" className="hover:text-emerald-400 transition">আমার বিজ্ঞাপন</Link></li>
            <li><Link to="/login" className="hover:text-emerald-400 transition">লগইন</Link></li>
            <li><Link to="/register" className="hover:text-emerald-400 transition">রেজিস্ট্রেশন</Link></li>
          </ul>
        </div>

        {/* যোগাযোগ ও হেল্পলাইন */}
        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
            সাপোর্ট ও যোগাযোগ
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>সাতমাথা, বগুড়া সদর, বগুড়া</span>
            </li>
           
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>support@boguratolet.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-4 gap-2">
        <p>© {new Date().getFullYear()} BoguraToLet.com — সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="flex items-center gap-1">
          বগুড়ার মানুষের জন্য ভালোবাসায় তৈরি <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
        </p>
      </div>
    </footer>
  );
}