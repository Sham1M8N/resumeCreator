const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-sonnet-4-6';

// Input size limits
const MAX_JOB_DESCRIPTION_BYTES = 100 * 1024;  // 100KB
const MAX_PROFILE_DATA_BYTES = 200 * 1024;      // 200KB

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map();
const RATE_LIMIT = 10;        // max requests
const RATE_WINDOW_MS = 60 * 60 * 1000; // per hour

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

  // Rate limiting
  const clientIp = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return { statusCode: 429, headers: securityHeaders, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) };
  }

  const API_KEY = process.env.OPENROUTER_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, headers: securityHeaders, body: JSON.stringify({ error: 'Server configuration error.' }) };
  }

  // Input size check
  const bodySize = Buffer.byteLength(event.body || '', 'utf8');
  if (bodySize > MAX_PROFILE_DATA_BYTES + MAX_JOB_DESCRIPTION_BYTES) {
    return { statusCode: 413, headers: securityHeaders, body: JSON.stringify({ error: 'Request payload too large.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { profileData, jobDescription, matchedKeywords } = body;

  if (!profileData || typeof profileData !== 'object') {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'profileData must be an object.' }) };
  }
  if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'jobDescription must be a non-empty string.' }) };
  }
  if (Buffer.byteLength(jobDescription, 'utf8') > MAX_JOB_DESCRIPTION_BYTES) {
    return { statusCode: 413, headers: securityHeaders, body: JSON.stringify({ error: 'Job description is too large.' }) };
  }
  if (Buffer.byteLength(JSON.stringify(profileData), 'utf8') > MAX_PROFILE_DATA_BYTES) {
    return { statusCode: 413, headers: securityHeaders, body: JSON.stringify({ error: 'Profile data is too large.' }) };
  }

  const keywords = Array.isArray(matchedKeywords) ? matchedKeywords : [];
  const experienceLines = (profileData.workExperiences || [])
    .slice(0, 2)
    .map(w => `${w.title || ''} at ${w.company || ''}`)
    .join('\n');

  const systemPrompt = `You are a professional cover letter writer. Write concisely and specifically. Never use generic filler phrases.`;

  const userPrompt = `Write a cover letter for this candidate applying to this role.

Candidate Profile:
Name: ${profileData.fullName || ''}
Summary: ${profileData.summary || ''}
Key Skills: ${(profileData.skills || []).join(', ')}
Experience:
${experienceLines}

Job Description:
${jobDescription.substring(0, 3000)}

Matched Keywords to incorporate naturally: ${keywords.join(', ')}

Write exactly 3 paragraphs:
1. Opening: specific role interest + strongest qualification
2. Body: 2-3 concrete achievements relevant to this role
3. Closing: enthusiasm + call to action

Return plain text only. No subject line. No 'Dear Hiring Manager' header. Start directly with the first paragraph.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://resumecreat3.netlify.app',
        'X-Title': 'Resume Creator - Cover Letter'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      if (response.status === 429) return { statusCode: 429, headers: securityHeaders, body: JSON.stringify({ error: 'Too many requests. Please wait and try again.' }) };
      if (response.status >= 500) return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'AI service temporarily unavailable. Please try again later.' }) };
      return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'Failed to generate cover letter. Please try again.' }) };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'No content received from AI.' }) };

    const cleanedContent = content
      .replace(/```[a-z]*\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return {
      statusCode: 200,
      headers: securityHeaders,
      body: JSON.stringify({ coverLetter: cleanedContent })
    };
  } catch {
    return { statusCode: 500, headers: securityHeaders, body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }) };
  }
};
