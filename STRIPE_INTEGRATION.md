# Stripe Integration Guide

This document outlines how to add Stripe payment processing to the Loomin pricing system.

## 🎯 Current State

The pricing system is structured with **Stripe integration hooks** ready to be implemented:

1. **UpgradeModal** - Shows upgrade prompt
2. **PricingCard** - Displays plan options
3. **Services/plans.ts** - Manages plan logic
4. **Pricing page** - CTA buttons

## 🔧 Integration Steps

### Step 1: Install Stripe Dependencies

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js stripe
```

### Step 2: Add Environment Variables

```env
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

### Step 3: Create Stripe API Routes

#### `/src/app/api/create-checkout-session/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Loomin Pro",
              description: "Unlimited playlists and advanced features",
            },
            unit_amount: 500, // $5.00
            recurring: {
              interval: "month",
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      customer_email: email,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating session" },
      { status: 500 },
    );
  }
}
```

#### `/src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    // Handle subscription events
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;

        // Update user plan in database
        const userId = session.metadata?.userId;
        if (userId) {
          // Update user: { plan: 'pro' }
          // Call your auth service or database
          const users = JSON.parse(
            localStorage.getItem("loomin_users") || "[]",
          );
          const userIndex = users.findIndex((u: any) => u.id === userId);
          if (userIndex !== -1) {
            users[userIndex].plan = "pro";
            users[userIndex].stripeSubscriptionId = session.subscription;
            localStorage.setItem("loomin_users", JSON.stringify(users));
          }
        }
        break;

      case "customer.subscription.deleted":
        // Handle cancellation - downgrade to free
        const subscription = event.data.object as Stripe.Subscription;
        // Downgrade user logic here
        break;

      case "invoice.payment_failed":
        // Handle failed payment - send email
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
```

### Step 4: Update UpgradeModal Component

Replace the mock upgrade in `components/UpgradeModal.tsx`:

```typescript
import { loadStripe } from "@stripe/stripe-js";

const handleUpgrade = async () => {
  setIsLoading(true);

  try {
    // Create checkout session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.id,
        email: currentUser.email,
      }),
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    );

    await stripe?.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error("Upgrade error:", error);
    setIsLoading(false);
  }
};
```

### Step 5: Update Pricing Page

Add Stripe session handling in `app/pricing/page.tsx`:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Verify payment and update user
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    // Call verify endpoint to confirm upgrade
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });

    if (response.ok) {
      setShowSuccessMessage(true);
      // Refresh user data
      setCurrentUser({ ...currentUser, plan: 'pro' });
    }
  };

  return (
    // ... existing code ...
    {showSuccessMessage && (
      <motion.div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
        <p className="text-green-500 font-semibold">
          🎉 Welcome to Pro! Your upgrade is complete.
        </p>
      </motion.div>
    )}
  );
}
```

### Step 6: Create Verification Endpoint

#### `/src/app/api/verify-payment/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const userId = session.metadata?.userId;

      // Update user in your database
      // For now, this is handled by webhook

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
```

## 🧪 Testing Stripe Integration

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Expired: 04/25
CVC: 242
```

### Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## 📋 Checklist

- [ ] Install Stripe packages
- [ ] Add environment variables
- [ ] Create checkout session API route
- [ ] Create webhook handler route
- [ ] Create payment verification route
- [ ] Update UpgradeModal with Stripe redirect
- [ ] Update Pricing page with success handling
- [ ] Test with Stripe test cards
- [ ] Test webhook handling
- [ ] Deploy to production
- [ ] Switch to live API keys
- [ ] Monitor Stripe dashboard

## 🔐 Security Considerations

1. **API Keys**: Never expose `STRIPE_SECRET_KEY` in client code
2. **Webhook Verification**: Always verify webhook signatures
3. **Idempotency**: Use idempotent keys for payment requests
4. **Rate Limiting**: Implement rate limiting on payment endpoints
5. **HTTPS Only**: Stripe requires HTTPS in production

## 📊 Monitoring

- Check Stripe Dashboard for failed payments
- Set up email notifications for payment issues
- Monitor webhook delivery logs
- Track churn/retention metrics

## 💬 Support

For Stripe documentation:

- https://stripe.com/docs/payments
- https://stripe.com/docs/billing/subscriptions
- https://stripe.com/docs/webhooks

For questions about this implementation:

- Review `PRICING_SYSTEM.md` for architecture
- Check `services/plans.ts` for plan logic
- See `components/UpgradeModal.tsx` for integration point
