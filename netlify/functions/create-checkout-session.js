const STRIPE_API_URL = 'https://api.stripe.com/v1/checkout/sessions';

const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const isRateLimited = (ip) => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_WINDOW_MS;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT;
};

const securityHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://resumecreat3.netlify.app',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: securityHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const clientIp = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return { statusCode: 429, headers: securityHeaders, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return { statusCode: 500, headers: securityHeaders, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
  if (!STRIPE_PRICE_ID) {
    return { statusCode: 500, headers: securityHeaders, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { priceId } = body;
  if (!priceId || priceId !== STRIPE_PRICE_ID) {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid price.' }) };
  }

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('payment_method_types[0]', 'card');
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  params.append('success_url', 'https://resumecreat3.netlify.app/?payment=success&session_id={CHECKOUT_SESSION_ID}');
  params.append('cancel_url', 'https://resumecreat3.netlify.app/?payment=cancelled');

  try {
    const response = await fetch(STRIPE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'Payment provider error.' }) };
    }

    const session = await response.json();
    return { statusCode: 200, headers: securityHeaders, body: JSON.stringify({ url: session.url }) };
  } catch {
    return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'Payment provider error.' }) };
  }
};
