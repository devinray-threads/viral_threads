// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function getSiteUrl(req) {
  const origin = req.headers.origin;
  if (origin) return origin.replace(/\/$/, '');

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host) {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    return `${proto}://${host}`.replace(/\/$/, '');
  }

  return null;
}

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

    const siteUrl = getSiteUrl(req);
    if (!siteUrl) {
      return res.status(500).json({ error: 'Could not determine site URL for checkout redirect' });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || 'Viral Threads Tee',
          metadata: { product_id: String(item.id || '') },
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.qty || 1,
    }));

    const cartMetadata = JSON.stringify(
      items.map((item) => ({ id: item.id, qty: item.qty || 1 }))
    );

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      phone_number_collection: { enabled: true },
      metadata: { cart_items: cartMetadata },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
