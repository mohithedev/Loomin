'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { PricingCard } from '@/components/PricingCard';
import { UpgradeModal } from '@/components/UpgradeModal';
import { getPlanFeatures, getPricingInfo } from '@/services/plans';
import { isLoggedIn, getCurrentUser, logout } from '@/services/auth';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    setUserLoggedIn(loggedIn);
    if (loggedIn) {
      setCurrentUser(getCurrentUser());
    }
  }, []);

  const handleLoginSuccess = () => {
    setUserLoggedIn(true);
    setCurrentUser(getCurrentUser());
  };

  const handleLogout = () => {
    logout();
    setUserLoggedIn(false);
    setCurrentUser(null);
  };

  const handleFreeGetStarted = () => {
    if (userLoggedIn) {
      // Already logged in, go to dashboard
      router.push('/');
    } else {
      // Redirect to home to show login modal
      router.push('/');
    }
  };

  const handleProUpgrade = async () => {
    if (!userLoggedIn) {
      // Redirect to login
      router.push('/');
      return;
    }

    setIsLoading(true);
    // Simulate Stripe checkout
    setTimeout(() => {
      // In production, this would redirect to Stripe
      const users = JSON.parse(localStorage.getItem('loomin_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].plan = 'pro';
        localStorage.setItem('loomin_users', JSON.stringify(users));
        localStorage.setItem('loomin_current_user', JSON.stringify({ ...currentUser, plan: 'pro' }));
        setCurrentUser({ ...currentUser, plan: 'pro' });
      }
      setIsLoading(false);
      setShowUpgradeModal(false);
      alert('Welcome to Pro! 🎉');
    }, 1000);
  };

  const pricingInfo = getPricingInfo();
  const freeFeatures = getPlanFeatures('free');
  const proFeatures = getPlanFeatures('pro');

  return (
    <Layout onLogin={() => {}} onLogout={handleLogout} isLoggedIn={userLoggedIn}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 mt-12"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-primary mb-4"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-secondary mb-8 max-w-2xl mx-auto"
        >
          Start free. Upgrade when you're ready to focus.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-secondary/60 mb-12"
        >
          No credit card required. Cancel anytime.
        </motion.p>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto"
      >
        {/* Free Plan */}
        <PricingCard
          name={pricingInfo.free.name}
          price={pricingInfo.free.price}
          period={pricingInfo.free.period}
          description={pricingInfo.free.description}
          features={freeFeatures}
          cta={pricingInfo.free.cta}
          onCtaClick={handleFreeGetStarted}
          isPopular={false}
        />

        {/* Pro Plan */}
        <PricingCard
          name={pricingInfo.pro.name}
          price={pricingInfo.pro.price}
          period={pricingInfo.pro.period}
          description={pricingInfo.pro.description}
          features={proFeatures}
          cta={pricingInfo.pro.cta}
          onCtaClick={() => setShowUpgradeModal(true)}
          isPopular={true}
          isPro={true}
        />
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto bg-primary/50 border border-primary/30 rounded-2xl p-8 sm:p-12 mb-20"
      >
        <h2 className="text-2xl font-bold text-primary mb-8">Frequently asked questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-xs text-accent">?</span>
              Can I switch plans anytime?
            </h3>
            <p className="text-secondary text-sm ml-7">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-xs text-accent">?</span>
              Do you offer refunds?
            </h3>
            <p className="text-secondary text-sm ml-7">
              Absolutely. If you're not satisfied, we'll refund your subscription within 30 days, no questions asked.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-xs text-accent">?</span>
              What payment methods do you accept?
            </h3>
            <p className="text-secondary text-sm ml-7">
              We accept all major credit cards through Stripe. Your payment information is secure and encrypted.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center text-xs text-accent">?</span>
              Is there a free trial for Pro?
            </h3>
            <p className="text-secondary text-sm ml-7">
              Yes! Start with our Free plan and upgrade whenever you're ready. First month is 50% off for annual plans.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-20"
      >
        <p className="text-secondary mb-4">Ready to start your learning journey?</p>
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-all shadow-lg shadow-accent/30"
        >
          Get Started Free <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleProUpgrade}
        reason="general"
      />
    </Layout>
  );
}
