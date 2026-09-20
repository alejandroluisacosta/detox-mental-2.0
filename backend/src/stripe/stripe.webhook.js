import Stripe from 'stripe';
import { findUserById } from '../auth/auth.service.js';
import {
  findUserByStripeCustomerId,
  updateUserPaidStatus,
  unlockAllSessionsForUser,
} from './stripe.service.js';

let defaultStripe;

const getDefaultStripe = () => {
  defaultStripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return defaultStripe;
};

export function createHandleWebhook({
  stripe,
  findUserById: lookupById = findUserById,
  findUserByStripeCustomerId: lookupByCustomer = findUserByStripeCustomerId,
  updateUserPaidStatus: grantPaid = updateUserPaidStatus,
  unlockAllSessionsForUser: unlockSessions = unlockAllSessionsForUser,
} = {}) {
  return async function handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const client = stripe ?? getDefaultStripe();

    let event;
    try {
      event = client.webhooks.constructEvent(
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
        user = await lookupById(session.metadata.user_id);
      }
      if (!user && session.customer) {
        user = await lookupByCustomer(session.customer);
      }

      if (!user) {
        console.error('[stripe/webhook] no user found for session:', session.id);
        return res.status(400).json({ message: 'User not found.' });
      }

      await grantPaid(user.id, session.payment_intent);
      await unlockSessions(user.id);
    }

    return res.json({ received: true });
  };
}

export const handleWebhook = createHandleWebhook();
