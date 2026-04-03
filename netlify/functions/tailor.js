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
  if (bodySize > MAX_PROFILE_DATA_BYTES + MAX_JOB_DESCRIPTION_BYTES) {
    return { statusCode: 413, headers: securityHeaders, body: JSON.stringify({ error: 'Request payload too large.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: securityHeaders, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { profileData, jobDescription } = body;

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

  const prompt = `You are an expert resume writer and job market analyst. Analyze the following job description and user's profile data. Tailor the resume to best match the job requirements while remaining truthful to the candidate's actual experience.

Your analysis should:
1. Identify required skills, keywords, seniority level, and company tone from the job description
2. Rewrite the professional summary to target this specific role
3. Reorder and rewrite work experience bullet points to emphasize most relevant experience first
4. Highlight skills that match the job requirements
5. Suggest 2-3 important keywords from the job description that should be naturally incorporated

Profile Data:
${JSON.stringify(profileData, null, 2)}

Job Description:
${jobDescription}

Return ONLY valid JSON in this exact format:
{
  "summary": "Professional summary tailored to the job requirements",
  "workExperiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bulletPoints": ["Rewritten and reordered bullet point emphasizing relevance to target role"]
    }
  ],
  "skills": ["Skills reordered by relevance to job description, matched skills first"],
  "education": [
    {
      "institution": "Institution Name",
      "degree": "Degree",
      "fieldOfStudy": "Field",
      "startDate": "Month Year",
      "graduationDate": "Month Year",
      "gpa": "",
      "highlights": ["Any relevant highlights for this role"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": "Technologies",
      "description": "Description tailored to show relevance",
      "githubUrl": ""
    }
  ],
  "matchedKeywords": ["Keywords found in both resume and job description"],
  "missingKeywords": ["Important keywords from job description not found in resume"],
  "matchScore": 75,
  "suggestions": ["Specific suggestion to improve resume match", "Another actionable suggestion", "Third suggestion"]
}

Notes:
- matchScore should be a number from 0-100
- missingKeywords should contain 3-5 important keywords not in the resume
- suggestions should contain 2-3 specific, actionable tips for the candidate
- Keep all content professional and honest - do not fabricate experience
- Return ONLY valid JSON, no additional text or markdown formatting`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://resumecreator.netlify.app',
        'X-Title': 'Resume Creator - Job Targeting'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 5000
      })
    });

    if (!response.ok) {
      if (response.status === 429) return { statusCode: 429, headers: securityHeaders, body: JSON.stringify({ error: 'Too many requests. Please wait and try again.' }) };
      if (response.status >= 500) return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'AI service temporarily unavailable. Please try again later.' }) };
      return { statusCode: 502, headers: securityHeaders, body: JSON.stringify({ error: 'Failed to tailor resume. Please try again.' }) };
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
