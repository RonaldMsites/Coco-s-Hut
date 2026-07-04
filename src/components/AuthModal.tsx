import React from "react";
import { useState } from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';
import { t } from '../i18n';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUserEmail, setUserName, language, pendingWishlistId, setPendingWishlistId, addToWishlist } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUserEmail(userCredential.user.email || '');
        setUserName(userCredential.user.displayName || email.split('@')[0]);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setUserEmail(userCredential.user.email || '');
        setUserName(name || email.split('@')[0]);
      }
      
      setAuthModalOpen(false);
      if (pendingWishlistId) {
        addToWishlist(email, pendingWishlistId);
        setPendingWishlistId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <button 
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? t(language, 'login') : 'Create Account'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isLogin ? 'Welcome back to Coco\'s Hut' : 'Join Coco\'s Hut today'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input 
                  required 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(language, 'email')}</label>
              <input 
                required 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                required 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors mt-4 disabled:opacity-75"
            >
              {loading ? t(language, 'processing') : (isLogin ? t(language, 'login') : 'Sign Up')}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-indigo-600 hover:text-indigo-800"
            >
              {isLogin ? "Sign Up" : t(language, 'login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
