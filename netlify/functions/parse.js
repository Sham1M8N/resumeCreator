const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-sonnet-4-6';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const API_KEY = process.env.OPENROUTER_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured on server.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { rawResumeText } = body;
  if (!rawResumeText) {
    return { statusCode: 400, body: JSON.stringify({ error: 'rawResumeText is required.' }) };
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
      const errorData = await response.json().catch(() => ({}));
      return { statusCode: response.status, body: JSON.stringify({ error: errorData.error?.message || 'Failed to parse resume.' }) };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { statusCode: 502, body: JSON.stringify({ error: 'No content received from AI.' }) };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
