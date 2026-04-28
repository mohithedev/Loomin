// Plan management and limit checking utilities

import { User } from '../types';

export const PLAN_LIMITS = {
  free: {
    maxPlaylists: 2,
    maxCoursesPerPlaylist: Infinity,
    features: [
      'Up to 2 playlists',
      'Sequential video unlocking',
      'Basic progress tracking',
      'Focus mode (distraction-free UI)',
      'Resume last video',
    ],
  },
  pro: {
    maxPlaylists: Infinity,
    maxCoursesPerPlaylist: Infinity,
    features: [
      'Unlimited playlists',
      'Advanced progress tracking',
      'Notes per video',
      'Bookmark timestamps',
      'AI summaries (coming soon)',
      'Priority access to new features',
    ],
  },
};

/**
 * Check if user can create a new playlist
 * @param user - Current user
 * @param currentPlaylistCount - Number of playlists user already has
 * @returns true if user can create, false if at limit
 */
export const canCreatePlaylist = (user: User | null, currentPlaylistCount: number): boolean => {
  if (!user) return false;
  
  const limit = PLAN_LIMITS[user.plan].maxPlaylists;
  return currentPlaylistCount < limit;
};

/**
 * Get remaining playlists user can create
 * @param user - Current user
 * @param currentPlaylistCount - Number of playlists user already has
 * @returns Number of remaining playlists (Infinity for pro users)
 */
export const getRemainingPlaylists = (user: User | null, currentPlaylistCount: number): number => {
  if (!user) return 0;
  
  if (user.plan === 'pro') return Infinity;
  return Math.max(0, PLAN_LIMITS.free.maxPlaylists - currentPlaylistCount);
};

/**
 * Get features available for a plan
 * @param plan - Plan type ('free' | 'pro')
 * @returns Array of feature strings
 */
export const getPlanFeatures = (plan: 'free' | 'pro') => {
  return PLAN_LIMITS[plan].features;
};

/**
 * Check if user has access to a specific feature
 * @param user - Current user
 * @param featureName - Feature to check
 * @returns true if user has access
 */
export const hasFeatureAccess = (user: User | null, featureName: string): boolean => {
  if (!user) return false;
  
  const features = PLAN_LIMITS[user.plan].features;
  return features.some(f => f.toLowerCase().includes(featureName.toLowerCase()));
};

/**
 * Upgrade user to pro plan
 * @param user - User to upgrade
 * @returns Updated user object
 */
export const upgradeUserToPro = (user: User): User => {
  return {
    ...user,
    plan: 'pro',
  };
};

/**
 * Downgrade user to free plan
 * @param user - User to downgrade
 * @returns Updated user object
 */
export const downgradeUserToFree = (user: User): User => {
  return {
    ...user,
    plan: 'free',
  };
};

/**
 * Get pricing information
 * @returns Pricing data for display
 */
export const getPricingInfo = () => ({
  free: {
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Start free. Upgrade when you\'re ready to focus.',
    cta: 'Get Started Free',
    badge: null,
  },
  pro: {
    name: 'Pro',
    price: 5,
    period: '/month',
    description: 'Unlimited learning with advanced features',
    cta: 'Upgrade to Pro',
    badge: 'Most Popular',
  },
});
