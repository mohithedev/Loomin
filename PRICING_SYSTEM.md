# Pricing System Documentation

## Overview

Loomin now includes a complete SaaS pricing system with Free and Pro plans. The system manages plan limits, features, and handles upgrade prompts.

## 📋 Plans

### Free Plan

- **Price**: $0/month
- **Max Playlists**: 2
- **Features**:
  - Up to 2 playlists
  - Sequential video unlocking
  - Basic progress tracking
  - Focus mode (distraction-free UI)
  - Resume last video

### Pro Plan

- **Price**: $5/month
- **Max Playlists**: Unlimited
- **Features**:
  - Unlimited playlists
  - Advanced progress tracking
  - Notes per video
  - Bookmark timestamps
  - AI summaries (coming soon)
  - Priority access to new features

## 🏗️ Architecture

### Components

#### 1. **PricingCard.tsx**

Reusable pricing card component that displays:

- Plan name and price
- Feature list with checkmarks
- Call-to-action button
- "Most Popular" badge for Pro plan
- Hover animations

```tsx
<PricingCard
  name="Pro"
  price={5}
  period="/month"
  description="Unlimited learning"
  features={features}
  cta="Upgrade to Pro"
  onCtaClick={handleUpgrade}
  isPopular={true}
  isPro={true}
/>
```

#### 2. **UpgradeModal.tsx**

Modal shown when users hit plan limits. Features:

- Reason-based messaging
- Features highlight
- Upgrade button with Stripe hook
- "Maybe later" option

```tsx
<UpgradeModal
  isOpen={showUpgradeModal}
  onClose={handleClose}
  onUpgrade={handleUpgrade}
  reason="playlist_limit_reached"
/>
```

#### 3. **FeatureBadge.tsx**

Components for showing plan-specific features:

- `FeatureBadge`: Shows "Pro only" label
- `FeatureLock`: Overlay for locked features

### Services

#### **services/plans.ts**

Core utilities for plan management:

```typescript
// Check if user can create playlist
canCreatePlaylist(user, currentCount): boolean

// Get remaining playlists
getRemainingPlaylists(user, currentCount): number

// Get plan features
getPlanFeatures(plan): string[]

// Check feature access
hasFeatureAccess(user, featureName): boolean

// Upgrade/downgrade users
upgradeUserToPro(user): User
downgradeUserToFree(user): User

// Get pricing info
getPricingInfo(): PricingInfo
```

### Updated Components

#### **Navbar.tsx**

Enhanced with:

- Pricing link (center)
- Conditional buttons:
  - Guest: "Get Started"
  - Free user: "Upgrade" button with Zap icon
  - Pro user: "Pro" badge

#### **Dashboard.tsx**

New features:

- Plan badge in header
- Remaining playlists counter (free users)
- "Upgrade to Pro" link in header (free users)

#### **page.tsx (Home)**

- Plan limit checking on course creation
- Shows UpgradeModal when limit reached
- Prevents free users from exceeding 2 playlists

## 📄 Pricing Page

New `/pricing` route with:

- Hero section with value proposition
- Side-by-side pricing cards
- FAQ section
- CTA buttons with full flow

## 🔐 Plan Limits

### Free Plan

```typescript
{
  maxPlaylists: 2,
  maxCoursesPerPlaylist: Infinity
}
```

### Pro Plan

```typescript
{
  maxPlaylists: Infinity,
  maxCoursesPerPlaylist: Infinity
}
```

## 🔄 User Flow

### Creating a Course

```
User tries to create course
  ↓
Check plan limits (canCreatePlaylist)
  ↓
[Free user at 2 courses?] → Show UpgradeModal → Redirect to /pricing
  ↓
[OK to create] → Save course → Start video player
```

### Upgrading

```
Click "Upgrade" in navbar/dashboard
  ↓
Redirect to /pricing
  ↓
Click "Upgrade to Pro"
  ↓
Show UpgradeModal
  ↓
"Upgrade Now" → [Stripe integration point]
  ↓
Update user.plan = "pro"
  ↓
Refresh dashboard to show new limit
```

## 💳 Stripe Integration

The system is structured to easily add Stripe:

1. **UpgradeModal.tsx** - `handleUpgrade()` function
2. **pricing/page.tsx** - `handleProUpgrade()` function

### To add Stripe:

```typescript
// In handleUpgrade():
const response = await fetch("/api/create-checkout-session", {
  method: "POST",
  body: JSON.stringify({ userId: user.id }),
});

const { sessionId } = await response.json();
await stripe.redirectToCheckout({ sessionId });
```

### Webhook handler:

```typescript
// POST /api/webhooks/stripe
// Listen for checkout.session.completed
// Update user.plan = "pro" in database
```

## 🧪 Testing

### Test Free → Pro Flow

1. Sign up as new user (defaults to free)
2. Create 1st course (success)
3. Create 2nd course (success)
4. Create 3rd course (shows UpgradeModal)
5. Click "Upgrade Now"
6. Verify user.plan updated to "pro"
7. Create more courses (all succeed)

### Test Navbar Changes

- Not logged in: See "Get Started" button
- Logged in (free): See "Upgrade" button + Pricing link
- Logged in (pro): See "Pro" badge

### Test Dashboard

- Free user: See "X playlist(s) remaining" + "Upgrade to Pro" link
- Pro user: See "Pro" badge, no remaining counter

## 📝 Type Definitions

### User Interface

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro";
  createdAt: number;
  password?: string;
  provider?: "email" | "google" | "sso";
  resetToken?: string;
  resetTokenExpiry?: number;
}
```

### PlanType

```typescript
export type PlanType = "free" | "pro";
```

## 🎨 UI/UX Details

- **Pricing Cards**: Scale on hover (pro card scales more)
- **Color Scheme**: Uses accent color for pro features
- **Badges**: Subtle accent/20 background with border
- **Modals**: Blur backdrop, smooth animations
- **Responsive**: Stacks cards on mobile

## 🚀 Future Enhancements

1. **Annual Billing**: Add yearly plan option (20% discount)
2. **Team Plans**: Enterprise features for teams
3. **Usage Analytics**: Dashboard showing plan usage
4. **Feature Flags**: More granular feature control
5. **Trial Period**: 14-day free Pro trial
6. **Dunning**: Failed payment recovery
7. **Seat Management**: Per-seat pricing for teams

## 📊 Business Logic

### Default User State

All new users start with:

- `plan: 'free'`
- Access to 2 playlists
- Basic features only

### Upgrade Eligibility

- Any user can upgrade anytime
- No trial → direct to Stripe
- Immediate access after payment

### Downgrade Policy

- Users can downgrade anytime
- Pro features become locked
- Existing courses remain but can't add more (if over free limit)

## 🔗 Files Modified/Created

### Created

- `/src/services/plans.ts` - Plan utilities
- `/src/components/PricingCard.tsx` - Pricing card component
- `/src/components/UpgradeModal.tsx` - Upgrade modal
- `/src/components/FeatureBadge.tsx` - Feature lock components
- `/src/app/pricing/page.tsx` - Pricing page

### Modified

- `/src/types.ts` - Added PlanType and User interface
- `/src/services/auth.ts` - Added plan field to users
- `/src/components/Navbar.tsx` - Added pricing link + upgrade button
- `/src/components/Dashboard.tsx` - Added plan info + upgrade prompt
- `/src/app/page.tsx` - Added plan limit checking

## 📞 Support

For questions about the pricing system, check:

1. `services/plans.ts` for utility functions
2. `components/UpgradeModal.tsx` for upgrade flow
3. `app/pricing/page.tsx` for pricing page logic
