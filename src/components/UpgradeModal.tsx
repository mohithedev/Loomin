'use client';

import React, { useState } from 'react';
import { X, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: string; // Why they're seeing this (e.g., "playlist_limit_reached")
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  reason = 'general',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    // Simulate Stripe redirect
    setTimeout(() => {
      onUpgrade();
      setIsLoading(false);
    }, 500);
  };

  const reasons: Record<string, { title: string; message: string; icon: React.ReactNode }> = {
    playlist_limit_reached: {
      title: 'Unlock unlimited learning 🚀',
      message: 'You\'ve hit the playlist limit on the Free plan. Upgrade to Pro to create unlimited playlists and take your learning to the next level.',
      icon: <Zap className="w-8 h-8" />,
    },
    general: {
      title: 'Unlock unlimited learning 🚀',
      message: 'Upgrade to Pro and unlock advanced features including unlimited playlists, notes, bookmarks, and AI-powered summaries.',
      icon: <Zap className="w-8 h-8" />,
    },
  };

  const content = reasons[reason] || reasons.general;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-primary border border-primary/30 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-secondary/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-secondary" />
            </button>

            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-accent mb-4"
            >
              {content.icon}
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-primary mb-3">{content.title}</h2>

            {/* Message */}
            <p className="text-secondary mb-8 leading-relaxed">{content.message}</p>

            {/* Features List */}
            <div className="bg-secondary/10 rounded-xl p-4 mb-8 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-sm text-primary">Unlimited playlists</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-sm text-primary">Take notes & bookmark videos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-sm text-primary">Access future AI features</span>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="mb-8 text-center">
              <div className="text-3xl font-bold text-primary">$5</div>
              <div className="text-sm text-secondary">/month, cancel anytime</div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-accent/30 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </motion.button>
              <button
                onClick={onClose}
                className="w-full border border-primary/30 text-secondary hover:text-primary hover:bg-secondary/10 font-semibold py-3 rounded-xl transition-all"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
