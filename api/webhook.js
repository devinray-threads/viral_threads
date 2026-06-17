// api/webhook.js — Stripe webhooks (triggers Printful fulfillment on payment)
const { buffer } = require('micro');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createOrderFromStripeSession } = require('../lib/printful');

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = (await buffer(req)).toString('utf8');
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      try {
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['customer_details'],
        });

        const result = await createOrderFromStripeSession(fullSession);
        console.log('Printful order created:', result);
      } catch (err) {
        console.error('Printful fulfillment failed:', err.message);
        return res.status(500).json({ error: `Fulfillment failed: ${err.message}` });
      }
      break;
    }
    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
