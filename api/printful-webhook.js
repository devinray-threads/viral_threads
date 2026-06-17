// api/printful-webhook.js
const { buffer } = require('micro');
const { verifyWebhookSignature } = require('../lib/printful');

const HANDLED_EVENTS = new Set([
  'order_created',
  'order_updated',
  'order_failed',
  'order_canceled',
  'package_shipped',
  'shipment_sent',
  'shipment_delivered',
  'shipment_returned',
  'shipment_canceled',
]);

function handleShipmentEvent(event) {
  const shipment = event.data?.shipment;
  const order = event.data?.order;
  const tracking = shipment?.tracking_number || shipment?.tracking_url;

  console.log('Printful shipment update:', {
    type: event.type,
    orderId: order?.id || order?.external_id,
    tracking: tracking || 'pending',
    carrier: shipment?.carrier,
  });
}

function handleOrderEvent(event) {
  const order = event.data?.order;
  console.log('Printful order update:', {
    type: event.type,
    orderId: order?.id,
    externalId: order?.external_id,
    status: order?.status,
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let event;

  try {
    const rawBody = (await buffer(req)).toString('utf8');
    const signature = req.headers['x-pf-webhook-signature'];
    const webhookSecret = process.env.PRINTFUL_WEBHOOK_SECRET;

    if (signature && webhookSecret) {
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('Printful webhook signature verification failed');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    } else if (signature && !webhookSecret) {
      console.warn('Printful webhook received with signature but PRINTFUL_WEBHOOK_SECRET is not set');
      return res.status(500).json({ error: 'Printful webhook secret not configured' });
    }

    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('Printful webhook parse error:', err.message);
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const eventType = event.type;
  if (!eventType) {
    return res.status(400).json({ error: 'Missing event type' });
  }

  if (HANDLED_EVENTS.has(eventType)) {
    if (eventType.includes('shipment') || eventType === 'package_shipped') {
      handleShipmentEvent(event);
    } else {
      handleOrderEvent(event);
    }
  } else {
    console.log(`Unhandled Printful event: ${eventType}`);
  }

  res.status(200).json({ received: true });
};
