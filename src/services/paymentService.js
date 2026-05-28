export async function createCheckoutSession() {
  const priceId = process.env.REACT_APP_STRIPE_PRICE_ID;
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to start checkout.');
  }
  window.location.href = data.url;
}

export async function verifySession(sessionId) {
  try {
    const response = await fetch('/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const data = await response.json();
    return data.paid === true;
  } catch {
    return false;
  }
}

export function getProAccess() {
  return localStorage.getItem('resume_pro_access') === '1';
}

export function setProAccess() {
  localStorage.setItem('resume_pro_access', '1');
}
