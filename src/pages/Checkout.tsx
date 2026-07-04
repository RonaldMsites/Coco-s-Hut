import React from "react";
import { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { t } from '../i18n';

export default function Checkout() {
  const { cart, clearCart, language } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main St, Tech City, TC 10101',
    card: '4242 4242 4242 4242',
    exp: '12/26',
    cvv: '123'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        paymentDetails: { ...formData, card: '***' } // Mock secure payment
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsProcessing(false);
        if (data.success) {
          clearCart();
          alert(`Order placed successfully!\nYour Order ID is ${data.order.id}`);
          navigate(`/track/${data.order.id}`);
        }
      });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t(language, 'cartEmpty')}</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-medium underline">
          {t(language, 'continueShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-12 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Form */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">{t(language, 'checkout')}</h1>
            
            <form onSubmit={handleCheckout} className="space-y-8">
              {/* Contact Info */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">{t(language, 'contactInfo')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t(language, 'email')}</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t(language, 'phone')}</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">{t(language, 'shippingAddress')}</h2>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={3} className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              {/* Payment */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{t(language, 'paymentMethod')}</h2>
                  <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                    <Lock className="w-4 h-4" />
                    <span>Secure Encrypted</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t(language, 'cardNumber')}</label>
                    <div className="relative">
                      <input required type="text" value={formData.card} onChange={e => setFormData({...formData, card: e.target.value})} className="w-full border-gray-300 rounded-lg p-3 pl-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                      <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t(language, 'expiration')}</label>
                      <input required type="text" value={formData.exp} onChange={e => setFormData({...formData, exp: e.target.value})} className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t(language, 'cvv')}</label>
                      <input required type="text" value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value})} className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123" />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-75"
              >
                {isProcessing ? <span>{t(language, 'processing')}</span> : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t(language, 'pay')} ${total.toFixed(2)}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6">{t(language, 'orderSummary')}</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div className="flex space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="text-gray-500">{item.variant.color}, {item.variant.size} • Qty {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t(language, 'subtotal')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t(language, 'shipping')}</span>
                  <span>{t(language, 'free')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>{t(language, 'total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
