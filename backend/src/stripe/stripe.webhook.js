import Stripe from 'stripe';
import { findUserById } from '../auth/auth.service.js';
import {
  findUserByStripeCustomerId,
  updateUserPaidStatus,
  unlockAllSessionsForUser,
} from './stripe.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    let user = null;
    if (session.metadata?.user_id) {
      user = await findUserById(session.metadata.user_id);
    }
    if (!user && session.customer) {
      user = await findUserByStripeCustomerId(session.customer);
    }

    if (!user) {
      console.error('[stripe/webhook] no user found for session:', session.id);
      return res.status(400).json({ message: 'User not found.' });
    }

    await updateUserPaidStatus(user.id, session.payment_intent);
    await unlockAllSessionsForUser(user.id);
  }

  return res.json({ received: true });
}
