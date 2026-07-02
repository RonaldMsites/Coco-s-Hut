/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';
import AuthModal from './components/AuthModal';
import Wishlist from './pages/Wishlist';
import { useStore } from './store';
import { CheckCircle2 } from 'lucide-react';

function WelcomeToast() {
  const { userName } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (userName) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [userName]);

  return (
    <div 
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 ease-out pointer-events-none ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <CheckCircle2 className="w-5 h-5 text-green-400" />
      <span className="font-medium text-lg tracking-tight">Welcome back, {userName}!</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <Navbar />
        <WelcomeToast />
        <AuthModal />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track/:id" element={<OrderTracking />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
