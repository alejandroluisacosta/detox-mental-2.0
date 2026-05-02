import express from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { createCheckoutSession } from './stripe.controller.js';
import { handleWebhook } from './stripe.webhook.js';

const router = express.Router();

router.post('/create-checkout-session', requireAuth, createCheckoutSession);
router.post('/webhook', handleWebhook);

export default router;
