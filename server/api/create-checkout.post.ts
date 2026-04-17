import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Real-world Price IDs (Replace with your actual Stripe Price IDs)
const PRICE_IDS: Record<string, string> = {
  'starter': 'price_starter_dummy', // Replace with real IDs like 'price_1Q...'
  'pro': 'price_pro_dummy'
};

let stripe: Stripe | null = null;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { planId } = body;

  if (!STRIPE_SECRET_KEY) {
    // For demo purposes, if key is missing, return a dummy redirect
    // In production, this would throw an error or crash.
    // I will simulate a "mock" checkout URL for this environment if no keys are set.
    return { 
      url: `${SITE_URL}/dashboard?status=success&mock_plan=${planId}` 
    };
  }

  if (!stripe) {
    stripe = new Stripe(STRIPE_SECRET_KEY);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[planId],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${SITE_URL}/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?status=cancel`,
      metadata: {
        planId: planId,
        // In a real app, you'd associate this with a userId
        // userId: body.userId 
      }
    });

    return { url: session.url };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
});
