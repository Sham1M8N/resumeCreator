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

  const { profileData, jobDescription } = body;
  if (!profileData || !jobDescription) {
    return { statusCode: 400, body: JSON.stringify({ error: 'profileData and jobDescription are required.' }) };
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
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData.error?.message;
      if (response.status === 401) return { statusCode: 401, body: JSON.stringify({ error: 'API key is invalid or missing.' }) };
      if (response.status === 429) return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests. Please wait and try again.' }) };
      if (response.status >= 500) return { statusCode: 502, body: JSON.stringify({ error: 'AI service temporarily unavailable.' }) };
      return { statusCode: response.status, body: JSON.stringify({ error: detail || 'Failed to tailor resume.' }) };
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
