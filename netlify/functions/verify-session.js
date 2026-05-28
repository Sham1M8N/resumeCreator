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

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { sessionId } = body;
  if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid session ID.' }) };
  }

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'Verification failed.' }) };
    }

    const session = await response.json();
    const paid = session.payment_status === 'paid';
    return { statusCode: 200, headers: securityHeaders, body: JSON.stringify({ paid }) };
  } catch {
    return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'Verification failed.' }) };
  }
};
