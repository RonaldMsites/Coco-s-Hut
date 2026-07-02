import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Package, Menu, Shield, LogIn, LogOut, Heart } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';
import { t } from '../i18n';

export default function Navbar() {
  const navigate = useNavigate();
  const { role, setRole, cart, language, setLanguage, userEmail, setUserEmail, setAuthModalOpen, wishlists } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAdmin = userEmail === 'ronaldmulenga2000@gmail.com';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-gray-900">
              Coco's Hut
            </Link>
            
            <form onSubmit={handleSearch} className="hidden md:flex relative w-96">
              <input
                type="text"
                placeholder={t(language, 'searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-full focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </form>
          </div>

          <div className="flex items-center space-x-6">
            {isAdmin && (
              <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-full p-1 border border-gray-200">
                <button 
                  onClick={() => setRole('buyer')}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${role === 'buyer' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  {t(language, 'buyerView')}
                </button>
                <button 
                  onClick={() => setRole('admin')}
                  className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-1 transition-colors ${role === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{t(language, 'adminView')}</span>
                </button>
              </div>
            )}

            <select 
              className="text-sm bg-transparent border-none text-gray-600 focus:ring-0 cursor-pointer outline-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
              <option value="zh">ZH</option>
              <option value="hi">HI</option>
              <option value="pt">PT</option>
            </select>

            {isAdmin && role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Package className="w-5 h-5" />
              </Link>
            )}

            {userEmail ? (
              <button onClick={() => { setUserEmail(null); setRole('buyer'); }} className="text-gray-600 hover:text-gray-900 transition-colors" title={t(language, 'logout')}>
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)} 
                className="text-gray-600 hover:text-gray-900 transition-colors" 
                title={t(language, 'login')}
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}

            {userEmail && (
              <Link to="/wishlist" className="text-gray-600 hover:text-gray-900 transition-colors relative" title={t(language, 'wishlist') || 'Wishlist'}>
                <Heart className="w-5 h-5" />
                {(wishlists[userEmail] || []).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {(wishlists[userEmail] || []).length}
                  </span>
                )}
              </Link>
            )}

            <Link to="/checkout" className="text-gray-600 hover:text-gray-900 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
