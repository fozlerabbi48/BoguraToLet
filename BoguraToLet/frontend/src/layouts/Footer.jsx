import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Phone, Mail, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const areas = ['জলেশ্বরীতলা', 'বনানী', 'উপশহর', 'ফুলবাড়ী', 'মাটিডালী', 'চারমাথা'];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl mb-4">
              <Home className="w-6 h-6" />
              <span>BoguraToLet</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              বগুড়া শহরের সবচেয়ে নির্ভরযোগ্য বাসা ও মেস খোঁজার প্ল্যাটফর্ম। ঝামেলামুক্ত ভাড়ার নিশ্চয়তা।
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">জনপ্রিয় এলাকা</h4>
            <ul className="space-y-2 text-sm">
              {areas.map((area) => (
                <li key={area}>
                  <Link to={`/?q=${encodeURIComponent(area)}`} className="hover:text-emerald-400 transition-colors">
                    {area} তে বাসা ভাড়া
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">প্রয়োজনীয় লিংক</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">হোম পেজ</Link></li>
              <li><Link to="/create-property" className="hover:text-emerald-400 transition-colors">বিজ্ঞাপন দিন</Link></li>
              <li><Link to="/chat" className="hover:text-emerald-400 transition-colors">মেসেজ / চ্যাট</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">লগইন</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>বগুড়া সদর, বগুড়া</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <a href="tel:01700000000" className="hover:text-emerald-400">০১৭০০-০০০০০০</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <a href="mailto:support@boguratolet.com" className="hover:text-emerald-400">support@boguratolet.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} BoguraToLet. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for Bogura
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
