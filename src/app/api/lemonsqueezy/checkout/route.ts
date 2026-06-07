import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a Lemonsqueezy checkout session
 * This endpoint returns a checkout URL that redirects to Lemonsqueezy
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing userId or email' },
        { status: 400 }
      );
    }

    // Lemonsqueezy checkout URL
    // Get PRODUCT_ID from your Lemonsqueezy dashboard
    const productId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRODUCT_ID;
    const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;

    if (!productId || !storeId) {
      console.error('Missing Lemonsqueezy config');
      return NextResponse.json(
        { error: 'Payment configuration missing' },
        { status: 500 }
      );
    }

    // Build checkout URL with user metadata
    const checkoutUrl = new URL(
      `https://checkout.lemonsqueezy.com/checkout/buy/${productId}`
    );

    // Add metadata (customer email and user ID)
    checkoutUrl.searchParams.append('checkout[email]', email);
    checkoutUrl.searchParams.append('checkout[custom][userId]', userId);

    // Optional: Add success/cancel redirect URLs
    checkoutUrl.searchParams.append(
      'checkout[success_url]',
      `${process.env.NEXT_PUBLIC_APP_URL}/?upgrade=success`
    );
    checkoutUrl.searchParams.append(
      'checkout[cancel_url]',
      `${process.env.NEXT_PUBLIC_APP_URL}/?upgrade=cancelled`
    );

    return NextResponse.json({ checkoutUrl: checkoutUrl.toString() });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
