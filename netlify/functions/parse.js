const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-sonnet-4-6';

// Input size limits
const MAX_RESUME_TEXT_BYTES = 500 * 1024; // 500KB

// Simple in-memory rate limiter (resets on function cold start)
const rateLimitMap = new Map();
const RATE_LIMIT = 10;
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
  'Access-Control-Allow-Origin': 'same-origin',
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
  if (bodySize > MAX_RESUME_TEXT_BYTES) {
    return { statusCode: 413, headers: securityHeaders, body: JSON.stringify({ error: 'Request payload too large.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { rawResumeText } = body;
  if (!rawResumeText || typeof rawResumeText !== 'string' || !rawResumeText.trim()) {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'rawResumeText must be a non-empty string.' }) };
  }
  if (Buffer.byteLength(rawResumeText, 'utf8') > MAX_RESUME_TEXT_BYTES) {
    return { statusCode: 413, headers: securityHeaders, body: JSON.stringify({ error: 'Resume text is too large.' }) };
  }

  const prompt = `You are an expert resume parser and career advisor. Analyze the following resume text and:

1. Parse it into structured JSON with the following fields:
   - fullName (string)
   - email (string)
   - phone (string)
   - linkedIn (string, full URL if available)
   - github (string, full URL if available)
   - location (string, e.g., "City, State" or "City, Country")
   - summary (string, professional summary or objective)
   - skills (array of strings)
   - workExperiences (array of objects with: company, title, startDate, endDate, bulletPoints array)
   - education (array of objects with: institution, degree, fieldOfStudy, startDate, graduationDate, gpa, highlights array)
   - projects (array of objects with: name, tech (technologies used), description, githubUrl)
   - certifications (array of strings)

2. Generate follow-up questions about missing or weak information:
   - Identify critical missing information
   - Suggest improvements
   - Maximum 5-8 most important questions

Important parsing rules for EDUCATION entries:
- ALWAYS extract GPA if mentioned
- ALWAYS look for Dean's List, honors, or academic recognition
- Parse dates into readable format (e.g., "Jan 2020")

Additional rules:
- For missing fields, use empty string "" or empty array []
- If LinkedIn or GitHub URLs don't include https://, add it

Resume Text:
${rawResumeText}

Return ONLY valid JSON in this exact format:
{
  "parsedResume": {
    "fullName": "",
    "email": "",
    "phone": "",
    "linkedIn": "",
    "github": "",
    "location": "",
    "summary": "",
    "skills": [],
    "workExperiences": [{ "company": "", "title": "", "startDate": "", "endDate": "", "bulletPoints": [] }],
    "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "graduationDate": "", "gpa": "", "highlights": [] }],
    "projects": [{ "name": "", "tech": "", "description": "", "githubUrl": "" }],
    "certifications": []
  },
  "followUpQuestions": ["Question about missing or unclear information..."]
}

Return ONLY the JSON, no additional text or markdown formatting.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://resumecreator.netlify.app',
        'X-Title': 'Resume Creator - Resume Parser'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 6000
      })
    });

    if (!response.ok) {
      if (response.status === 429) return { statusCode: 429, headers: securityHeaders, body: JSON.stringify({ error: 'Too many requests. Please wait and try again.' }) };
      if (response.status >= 500) return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'AI service temporarily unavailable. Please try again later.' }) };
      return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'Failed to parse resume. Please try again.' }) };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'No content received from AI.' }) };

    return {
      statusCode: 200,
      headers: securityHeaders,
      body: content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    };
  } catch {
    return { statusCode: 500, headers: securityHeaders, body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }) };
  }
};
