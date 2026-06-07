import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Webhook handler for Lemonsqueezy events
 * Lemonsqueezy sends events when subscriptions are created, updated, or cancelled
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature') || '';

    // Verify webhook signature
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(body, 'utf8')
      .digest('hex');

    if (hash !== signature) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    console.log('Lemonsqueezy webhook received:', event.meta.event_name);

    const data = event.data;
    const attributes = data.attributes;
    const customData = attributes.customer_email_marketing_consent?.['custom'] || {};
    const userId = customData.userId || attributes.user_id;

    switch (event.meta.event_name) {
      case 'order_created':
      case 'subscription_created': {
        // User upgraded to pro
        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan: 'pro',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log(`✓ User ${userId} upgraded to pro`);
        }
        break;
      }

      case 'subscription_updated': {
        // Handle subscription updates (e.g., cancelled/active status)
        const status = attributes.status;

        if (status === 'cancelled' || status === 'expired') {
          // Downgrade to free when subscription ends
          if (userId) {
            await supabase
              .from('profiles')
              .update({
                plan: 'free',
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);

            console.log(`✓ User ${userId} subscription ended, downgraded to free`);
          }
        } else if (status === 'active') {
          // Keep pro status if still active
          if (userId) {
            await supabase
              .from('profiles')
              .update({
                plan: 'pro',
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);

            console.log(`✓ User ${userId} subscription is active`);
          }
        }
        break;
      }

      case 'subscription_cancelled': {
        // User cancelled subscription
        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log(`✓ User ${userId} cancelled subscription, downgraded to free`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
