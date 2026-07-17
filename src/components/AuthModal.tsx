import React from "react";
import { useState } from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';
import { t } from '../i18n';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUserEmail, setUserName, language, pendingWishlistId, setPendingWishlistId, addToWishlist } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingUserCredential, setPendingUserCredential] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const requestOtp = async (userEmail: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`OTP sent to your email! (For testing: ${data.mockOtp})`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (pendingUserCredential) {
        setUserEmail(pendingUserCredential.user.email || '');
        setUserName(pendingUserCredential.user.displayName || name || email.split('@')[0]);
      } else {
        setUserEmail(email);
        setUserName(name || email.split('@')[0]);
      }
      
      setAuthModalOpen(false);
      setIsOtpMode(false);
      setPendingUserCredential(null);
      
      if (pendingWishlistId) {
        addToWishlist(email, pendingWishlistId);
        setPendingWishlistId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isResetMode) {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset link sent! Check your email.');
      } else if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUserEmail(userCredential.user.email || '');
        setUserName(userCredential.user.displayName || email.split('@')[0]);
        setAuthModalOpen(false);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setPendingUserCredential(userCredential);
        setIsOtpMode(true);
        await requestOtp(email);
        return; // Don't close modal yet
      }
      
      if (!isResetMode && !isOtpMode && pendingWishlistId) {
        addToWishlist(email, pendingWishlistId);
        setPendingWishlistId(null);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please log in instead.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setAuthModalOpen(false);
    setIsResetMode(false);
    setError('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isOtpMode ? 'Verify Email' : (isResetMode ? 'Reset Password' : (isLogin ? t(language, 'login') : 'Create Account'))}
          </h2>
          <p className="text-gray-500 mb-8">
            {isOtpMode 
              ? `Enter the 6-digit code sent to ${email}` 
              : (isResetMode 
                ? 'Enter your email to receive a reset link' 
                : (isLogin ? 'Welcome back to Coco\'s Hut' : 'Join Coco\'s Hut today'))}
          </p>
          
          {isOtpMode ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Code</label>
                <input 
                  required 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-[0.5em] text-2xl font-mono" 
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              {message && (
                <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg">
                  {message}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors mt-4 disabled:opacity-75"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => requestOtp(email)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !isResetMode && (
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
              {!isResetMode && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    {isLogin && (
                      <button 
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setError('');
                          setMessage('');
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input 
                    required 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              )}
              
              {error && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {message && (
                <div className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg">
                  {message}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors mt-4 disabled:opacity-75"
              >
                {loading 
                  ? t(language, 'processing') 
                  : (isResetMode ? 'Send Reset Link' : (isLogin ? t(language, 'login') : 'Sign Up'))}
              </button>
            </form>
          )}
          
          {!isOtpMode && (
            <div className="mt-6 text-center text-sm text-gray-600">
              {isResetMode ? (
                <button 
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setError('');
                    setMessage('');
                  }}
                  className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Back to {t(language, 'login')}
                </button>
              ) : (
                <>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {isLogin ? "Sign Up" : t(language, 'login')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
