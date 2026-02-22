const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-sonnet-4-6';

/**
 * Tailors a resume based on profile data and job description using Claude via OpenRouter
 * @param {Object} profile - The user's profile data with all sections (contact, experience, skills, education, projects, certifications)
 * @param {string} jobDescription - The job description to tailor the resume for
 * @returns {Promise<Object>} Parsed JSON response with tailored resume content
 */
export const tailorResume = async (profile, jobDescription) => {
  if (!API_KEY) {
    throw new Error('OpenRouter API key is not configured. Please set REACT_APP_OPENROUTER_API_KEY in your environment variables.');
  }

  if (!profile || !jobDescription) {
    throw new Error('Both profile and job description are required.');
  }

  // Construct the prompt for Claude
  const prompt = `You are an expert resume writer. Given the following profile information and job description, tailor the resume content to best match the job requirements. Focus on highlighting relevant skills, experiences, and achievements that align with the job description.

Profile Data:
${JSON.stringify(profile, null, 2)}

Job Description:
${jobDescription}

Please provide a tailored resume in JSON format with the following structure:
{
  "fullName": "Full Name",
  "email": "email@example.com",
  "phone": "+1-XXX-XXX-XXXX",
  "linkedIn": "https://linkedin.com/in/username",
  "github": "https://github.com/username",
  "location": "City, State/Country",
  "summary": "A compelling professional summary tailored to the job",
  "workExperiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "bulletPoints": ["Tailored achievement or responsibility that highlights relevant skills"]
    }
  ],
  "skills": ["Prioritized list of skills most relevant to the job"],
  "education": [
    {
      "institution": "Institution Name",
      "degree": "Degree",
      "fieldOfStudy": "Field",
      "startDate": "YYYY-MM",
      "graduationDate": "YYYY-MM",
      "gpa": "3.8",
      "highlights": ["Notable achievement or relevant coursework"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": "Technologies used",
      "description": "Brief description",
      "githubUrl": "https://github.com/username/repo"
    }
  ],
  "certifications": ["Certification name and issuer"],
  "recommendations": ["Suggestions for improving alignment with the job description"]
}

Return ONLY valid JSON, no additional text or markdown formatting.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Resume Generator'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}. ${
          errorData.error?.message || JSON.stringify(errorData)
        }`
      );
    }

    const data = await response.json();
    
    // Extract the content from OpenAI-compatible response format
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenRouter API');
    }

    // Parse the JSON response from Claude
    // Remove any potential markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedResponse = JSON.parse(cleanedContent);
    
    return parsedResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse response as JSON: ${error.message}`);
    }
    throw error;
  }
};

export default {
  tailorResume
};
