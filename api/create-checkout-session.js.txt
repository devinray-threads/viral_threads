// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { items } = body || {};

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name || 'Viral Threads Tee' },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};