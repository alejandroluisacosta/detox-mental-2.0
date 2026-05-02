import Stripe from 'stripe';
import { updateUserStripeCustomerId } from './stripe.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(req, res) {
  const user = req.user;

  let stripeCustomerId = user.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    stripeCustomerId = customer.id;
    await updateUserStripeCustomerId(user.id, stripeCustomerId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    metadata: { user_id: user.id },
    success_url: `${process.env.FRONTEND_ORIGIN}/payment/success`,
    cancel_url: `${process.env.FRONTEND_ORIGIN}/payment/cancel`,
  });

  return res.json({ url: session.url });
}
