const crypto = require('crypto');
const productMap = require('./printful-products');

const PRINTFUL_API_BASE = 'https://api.printful.com';

function getApiToken() {
  return process.env.PRINTFUL_API_TOKEN;
}

async function printfulRequest(path, options = {}) {
  const token = getApiToken();
  if (!token) {
    throw new Error('PRINTFUL_API_TOKEN is not configured');
  }

  const response = await fetch(`${PRINTFUL_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || data?.result || `Printful API error (${response.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return data;
}

function verifyWebhookSignature(rawBody, signatureHeader, secretKeyHex) {
  if (!signatureHeader || !secretKeyHex) return false;

  try {
    const secretBuffer = Buffer.from(secretKeyHex, 'hex');
    const expected = crypto
      .createHmac('sha256', secretBuffer)
      .update(rawBody, 'utf8')
      .digest('hex');

    const received = signatureHeader.toLowerCase();
    if (expected.length !== received.length) return false;

    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
  } catch {
    return false;
  }
}

function mapItemsToPrintful(cartItems) {
  const items = [];
  const unmapped = [];

  for (const item of cartItems) {
    const mapping = productMap[item.id];
    if (!mapping?.sync_variant_id) {
      unmapped.push(mapping?.name || `product ${item.id}`);
      continue;
    }

    items.push({
      sync_variant_id: mapping.sync_variant_id,
      quantity: item.qty || 1,
      external_id: `vt-${item.id}`,
    });
  }

  if (unmapped.length > 0) {
    throw new Error(`Missing Printful sync_variant_id for: ${unmapped.join(', ')}`);
  }

  return items;
}

function buildRecipient(session) {
  const details = session.customer_details || {};
  const shipping = session.shipping_details || session.collected_information?.shipping_details;
  const address = shipping?.address;

  if (!address) {
    throw new Error('No shipping address on Stripe session — enable shipping_address_collection in checkout');
  }

  const name = shipping?.name || details.name || 'Customer';

  return {
    name,
    address1: address.line1,
    address2: address.line2 || '',
    city: address.city,
    state_code: address.state || '',
    country_code: address.country,
    zip: address.postal_code,
    email: details.email || '',
    phone: details.phone || shipping?.phone || '',
  };
}

function parseCartMetadata(session) {
  const raw = session.metadata?.cart_items;
  if (!raw) return [];

  try {
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    throw new Error('Invalid cart_items metadata on Stripe session');
  }
}

async function getOrderByExternalId(externalId) {
  try {
    const data = await printfulRequest(`/orders/@${encodeURIComponent(externalId)}`);
    return data.result || null;
  } catch (err) {
    if (err.message.includes('404') || err.message.includes('Not found')) {
      return null;
    }
    throw err;
  }
}

async function createOrderFromStripeSession(session) {
  const existing = await getOrderByExternalId(session.id);
  if (existing) {
    return {
      orderId: existing.id,
      externalId: session.id,
      status: existing.status,
      alreadyExists: true,
    };
  }

  const cartItems = parseCartMetadata(session);
  if (cartItems.length === 0) {
    throw new Error('No cart items found in Stripe session metadata');
  }

  const recipient = buildRecipient(session);
  const items = mapItemsToPrintful(cartItems);

  const orderPayload = {
    external_id: session.id,
    recipient,
    items,
  };

  const created = await printfulRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });

  const orderId = created.result?.id;
  if (!orderId) {
    throw new Error('Printful order created but no order ID returned');
  }

  const confirmed = await printfulRequest(`/orders/${orderId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  return {
    orderId,
    externalId: session.id,
    status: confirmed.result?.status || 'confirmed',
  };
}

module.exports = {
  createOrderFromStripeSession,
  verifyWebhookSignature,
  printfulRequest,
};
