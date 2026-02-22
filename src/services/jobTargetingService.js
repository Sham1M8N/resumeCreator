const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-sonnet-4-6';

/**
 * Tailors a resume to a specific job description by analyzing job requirements,
 * rewriting content, and identifying matched/missing keywords
 * @param {Object} profileData - The user's profile data (all resume sections)
 * @param {string} jobDescription - The job description to tailor the resume for
 * @returns {Promise<Object>} Tailored resume with match analysis
 */
export const tailorResumeToJob = async (profileData, jobDescription) => {
  if (!API_KEY) {
    throw new Error('OpenRouter API key is not configured. Please set REACT_APP_OPENROUTER_API_KEY in your environment variables.');
  }

  if (!profileData || !jobDescription) {
    throw new Error('Both profileData and jobDescription are required.');
  }

  // Construct the prompt for Claude
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
  "matchScore": 75
}

Notes:
- matchScore should be a number from 0-100 indicating how well the resume matches the job (0=poor match, 100=perfect match)
- matchedKeywords should contain skills/keywords that appear in both the resume and job description
- missingKeywords should contain 3-5 important keywords from the JD that are NOT in the resume (these represent skill/experience gaps)
- Keep all content professional and honest - do not fabricate experience
- Return ONLY valid JSON, no additional text or markdown formatting`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Resume Generator - Job Targeting Service'
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
        max_tokens: 5000
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
    
    // Validate required fields
    const requiredFields = ['summary', 'workExperiences', 'skills', 'education', 'projects', 'matchedKeywords', 'missingKeywords', 'matchScore'];
    for (const field of requiredFields) {
      if (!(field in parsedResponse)) {
        throw new Error(`Invalid response structure. Missing required field: ${field}`);
      }
    }

    // Ensure matchScore is a number between 0-100
    let matchScore = parsedResponse.matchScore;
    if (typeof matchScore !== 'number' || matchScore < 0 || matchScore > 100) {
      matchScore = 50; // Default to 50 if invalid
    }

    // Validate and clean up arrays
    const validatedResponse = {
      summary: parsedResponse.summary || '',
      workExperiences: Array.isArray(parsedResponse.workExperiences)
        ? parsedResponse.workExperiences.map(exp => ({
            company: exp.company || '',
            title: exp.title || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            bulletPoints: Array.isArray(exp.bulletPoints)
              ? exp.bulletPoints.filter(b => b)
              : []
          }))
        : [],
      skills: Array.isArray(parsedResponse.skills)
        ? parsedResponse.skills.filter(s => s)
        : [],
      education: Array.isArray(parsedResponse.education)
        ? parsedResponse.education.map(edu => ({
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            startDate: edu.startDate || '',
            graduationDate: edu.graduationDate || '',
            gpa: edu.gpa || '',
            highlights: Array.isArray(edu.highlights)
              ? edu.highlights.filter(h => h)
              : []
          }))
        : [],
      projects: Array.isArray(parsedResponse.projects)
        ? parsedResponse.projects.map(proj => ({
            name: proj.name || '',
            tech: proj.tech || '',
            description: proj.description || '',
            githubUrl: proj.githubUrl || ''
          }))
        : [],
      matchedKeywords: Array.isArray(parsedResponse.matchedKeywords)
        ? parsedResponse.matchedKeywords.filter(k => k)
        : [],
      missingKeywords: Array.isArray(parsedResponse.missingKeywords)
        ? parsedResponse.missingKeywords.filter(k => k)
        : [],
      matchScore: matchScore
    };

    return validatedResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
    throw error;
  }
};

export default {
  tailorResumeToJob
};
