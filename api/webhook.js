// api/webhook.js
const { buffer } = require('micro');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async function handler(req, res) {
  // #region agent log
  fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'E',location:'webhook.js:entry',message:'webhook handler invoked',data:{method:req.method,hasWebhookSecret:!!webhookSecret,hasStripeKey:!!process.env.STRIPE_SECRET_KEY,hasSignature:!!req.headers['stripe-signature']},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!webhookSecret) {
    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'E',location:'webhook.js:missing-secret',message:'STRIPE_WEBHOOK_SECRET missing',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = (await buffer(req)).toString('utf8');

    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'E',location:'webhook.js:raw-body',message:'raw webhook body read',data:{bodyLength:rawBody.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'E',location:'webhook.js:verify-failed',message:'webhook signature verification failed',data:{errorMessage:err.message},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful!', session.id);
      break;
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  // #region agent log
  fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'E',location:'webhook.js:success',message:'webhook processed',data:{eventType:event.type},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  res.status(200).json({ received: true });
};
