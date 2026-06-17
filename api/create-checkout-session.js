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
  // #region agent log
  fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'A,B,C,D',location:'create-checkout-session.js:entry',message:'checkout handler invoked',data:{method:req.method,hasStripeKey:!!process.env.STRIPE_SECRET_KEY,origin:req.headers.origin||null,host:req.headers.host||null,bodyType:typeof req.body},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'B',location:'create-checkout-session.js:missing-key',message:'STRIPE_SECRET_KEY missing',data:{},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { items } = body || {};

    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'C',location:'create-checkout-session.js:parsed-body',message:'request body parsed',data:{hasBody:!!body,itemCount:Array.isArray(items)?items.length:0,firstItem:Array.isArray(items)&&items[0]?{name:items[0].name,price:items[0].price,qty:items[0].qty}:null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    const siteUrl = getSiteUrl(req);
    if (!siteUrl) {
      // #region agent log
      fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'C',location:'create-checkout-session.js:missing-site-url',message:'could not determine site URL for redirect',data:{origin:req.headers.origin||null,host:req.headers.host||null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return res.status(500).json({ error: 'Could not determine site URL for checkout redirect' });
    }

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name || 'Viral Threads Tee' },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.qty || 1,
    }));

    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'C',location:'create-checkout-session.js:before-stripe',message:'creating Stripe checkout session',data:{siteUrl,lineItemCount:lineItems.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/`,
    });

    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'A',location:'create-checkout-session.js:success',message:'checkout session created',data:{sessionId:session.id,hasUrl:!!session.url},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    // #region agent log
    fetch('http://127.0.0.1:7640/ingest/cd5787ce-745f-4741-b0ad-a75acb2f2445',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ed7aa0'},body:JSON.stringify({sessionId:'ed7aa0',runId:'pre-fix',hypothesisId:'A,C',location:'create-checkout-session.js:catch',message:'checkout session failed',data:{errorMessage:error.message,errorType:error.type||null,errorCode:error.code||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
