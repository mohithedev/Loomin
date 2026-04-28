'use client';

import React from 'react';
import { Lock, Zap } from 'lucide-react';

interface FeatureBadgeProps {
  feature: string;
  isPro: boolean;
  showBadge?: boolean;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
  feature,
  isPro,
  showBadge = true,
}) => {
  const isProFeature = feature.toLowerCase().includes('notes') || 
                       feature.toLowerCase().includes('bookmark') ||
                       feature.toLowerCase().includes('ai');

  if (!isProFeature || isPro) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 border border-accent/40 rounded-full">
      <Lock className="w-3 h-3 text-accent" />
      <span className="text-xs font-semibold text-accent">Pro only</span>
    </div>
  );
};

/**
 * Feature lock overlay for disabled features
 */
export const FeatureLock: React.FC<{ children: React.ReactNode; isPro: boolean; feature?: string }> = ({
  children,
  isPro,
  feature = 'This feature',
}) => {
  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      <div className="opacity-60 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg backdrop-blur-sm">
        <div className="text-center">
          <Lock className="w-5 h-5 text-white mx-auto mb-2" />
          <p className="text-xs text-white font-semibold">{feature}</p>
          <p className="text-xs text-white/60">Upgrade to Pro</p>
        </div>
      </div>
    </div>
  );
};
