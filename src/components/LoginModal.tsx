'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, signUp, googleLogin, ssoLogin, requestPasswordReset } from '../services/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetSent, setShowResetSent] = useState(false);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = login(email, password);
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          setTimeout(() => {
            onSuccess?.();
            onClose();
            resetForm();
          }, 1000);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } else {
        const result = signUp(email, name, password);
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          setTimeout(() => {
            onSuccess?.();
            onClose();
            resetForm();
          }, 1000);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Mock Google login - in production, use actual Google OAuth
      const mockGoogleEmail = `user-${Date.now()}@gmail.com`;
      const mockGoogleName = 'Google User';
      
      const result = googleLogin(mockGoogleEmail, mockGoogleName);
      if (result.success) {
        setMessage({ type: 'success', text: 'Google login successful' });
        setTimeout(() => {
          onSuccess?.();
          onClose();
          resetForm();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Mock SSO login - in production, use actual SSO provider
      const mockSSOEmail = `sso-${Date.now()}@company.com`;
      const mockSSOName = 'SSO User';
      
      const result = ssoLogin(mockSSOEmail, mockSSOName);
      if (result.success) {
        setMessage({ type: 'success', text: 'SSO login successful' });
        setTimeout(() => {
          onSuccess?.();
          onClose();
          resetForm();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    setLoading(true);
    try {
      const result = requestPasswordReset(email);
      if (result.success) {
        setShowResetSent(true);
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          setShowResetSent(false);
          setShowForgotPassword(false);
          setEmail('');
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setEmail('');
    setName('');
    setPassword('');
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setIsLogin(true);
    setShowForgotPassword(false);
    setMessage(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-primary border border-primary rounded-3xl shadow-2xl overflow-hidden p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {showForgotPassword && (
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 left-4 p-2 hover:bg-secondary rounded-full transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="text-center space-y-6">
            {showForgotPassword ? (
              <>
                <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
                <p className="text-secondary text-sm">Enter your email to receive a password reset link</p>
                
                <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-secondary/50 border border-primary rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>

                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                          message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                        }`}
                      >
                        {message.type === 'success' ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl font-bold transition-all"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold tracking-tight">
                  {isLogin ? 'Log in to your account' : 'Create an account'}
                </h2>

                <div className="space-y-3">
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-primary rounded-xl hover:bg-secondary hover:border-accent hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-medium text-sm group disabled:opacity-50"
                  >
                    <Image 
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                      alt="Google" 
                      width={20}
                      height={20}
                      className="group-hover:rotate-12 transition-transform" 
                    />
                    <span>Continue with Google</span>
                  </button>
                  <button 
                    onClick={handleSSOLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-primary rounded-xl hover:bg-secondary hover:border-accent hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-medium text-sm group disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
                    <span>Continue with SSO</span>
                  </button>
                </div>

                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-primary" />
                  <span className="text-xs font-medium text-secondary uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-primary" />
                </div>

                <form className="space-y-4 text-left" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-secondary/50 border border-primary rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-secondary/50 border border-primary rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-secondary/50 border border-primary rounded-xl focus:ring-2 focus:ring-accent outline-none transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                      message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                        : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLogin && (
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-bold text-accent hover:underline ml-1"
                >
                  Forgot your password?
                </button>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/20 mt-4 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>

                <div className="pt-4 text-sm text-secondary">
                  {isLogin ? (
                    <p>
                      Don't have an account?{' '}
                      <button onClick={handleModeSwitch} className="text-accent font-bold hover:underline">
                        Sign up
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{' '}
                      <button onClick={handleModeSwitch} className="text-accent font-bold hover:underline">
                        Log in
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
