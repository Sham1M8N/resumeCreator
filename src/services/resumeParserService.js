const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-sonnet-4-6';

/**
 * Parse and analyze resume text using AI
 * @param {string} rawResumeText - Raw resume text to parse
 * @returns {Promise<Object>} Object with parsedResume and followUpQuestions
 */
export const parseAndAnalyzeResume = async (rawResumeText) => {
  if (!API_KEY) {
    throw new Error('OpenRouter API key is not configured. Please set REACT_APP_OPENROUTER_API_KEY in your environment variables.');
  }

  if (!rawResumeText || rawResumeText.trim().length === 0) {
    throw new Error('Resume text is required.');
  }

  // Construct the prompt for Claude
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
   - Identify critical missing information (e.g., no contact info, no experience dates)
   - Suggest improvements (e.g., missing GPA, vague bullets without metrics, no projects/portfolio)
   - Note any red flags or areas that could be strengthened
   - Ask about certifications, awards, or volunteer work if not mentioned
   - Maximum 5-8 most important questions

Important parsing rules for EDUCATION entries (CRITICAL - apply to EVERY education entry):
- ALWAYS extract GPA if mentioned in any format (3.8, 3.8/4.0, 3.8 GPA, etc.)
- ALWAYS look for and extract Dean's List mentions, honors, or other academic recognition
- ALWAYS extract academic achievements as highlights, including:
  - Dean's List, honors, scholarships, awards
  - Relevant coursework or specializations mentioned
  - Academic projects or thesis work mentioned
  - Academic honors, cum laude, magna cum laude, summa cum laude designations
- Even if no GPA is explicitly stated, indicate if honors/recognitions were achieved
- Include ALL academic achievements in the highlights array for each education entry
- Parse dates into readable format (e.g., "Jan 2020", "2020-2023")

Additional parsing rules:
- For missing fields, use empty string "" or empty array []
- Extract bullet points for work experience and education highlights
- Identify skills from both explicit skills sections and work experience
- Clean up formatting issues from the raw text
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
    "workExperiences": [
      {
        "company": "",
        "title": "",
        "startDate": "",
        "endDate": "",
        "bulletPoints": []
      }
    ],
    "education": [
      {
        "institution": "",
        "degree": "",
        "fieldOfStudy": "",
        "startDate": "",
        "graduationDate": "",
        "gpa": "",
        "highlights": []
      }
    ],
    "projects": [
      {
        "name": "",
        "tech": "",
        "description": "",
        "githubUrl": ""
      }
    ],
    "certifications": []
  },
  "followUpQuestions": [
    "Question about missing or unclear information..."
  ]
}

Return ONLY the JSON, no additional text or markdown formatting.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Resume Generator - Resume Parser'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 6000
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
    
    // Validate the response structure
    if (!parsedResponse.parsedResume || !parsedResponse.followUpQuestions) {
      throw new Error('Invalid response structure from AI. Missing parsedResume or followUpQuestions.');
    }

    // Ensure followUpQuestions is an array
    if (!Array.isArray(parsedResponse.followUpQuestions)) {
      parsedResponse.followUpQuestions = [];
    }

    // Validate and clean up parsed resume
    const validatedResume = {
      fullName: parsedResponse.parsedResume.fullName || '',
      email: parsedResponse.parsedResume.email || '',
      phone: parsedResponse.parsedResume.phone || '',
      linkedIn: parsedResponse.parsedResume.linkedIn || '',
      github: parsedResponse.parsedResume.github || '',
      location: parsedResponse.parsedResume.location || '',
      summary: parsedResponse.parsedResume.summary || '',
      skills: Array.isArray(parsedResponse.parsedResume.skills) 
        ? parsedResponse.parsedResume.skills.filter(s => s) 
        : [],
      workExperiences: Array.isArray(parsedResponse.parsedResume.workExperiences)
        ? parsedResponse.parsedResume.workExperiences.map(exp => ({
            company: exp.company || '',
            title: exp.title || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            bulletPoints: Array.isArray(exp.bulletPoints) 
              ? exp.bulletPoints.filter(b => b) 
              : []
          }))
        : [],
      education: Array.isArray(parsedResponse.parsedResume.education)
        ? parsedResponse.parsedResume.education.map(edu => ({
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
      projects: Array.isArray(parsedResponse.parsedResume.projects)
        ? parsedResponse.parsedResume.projects.map(proj => ({
            name: proj.name || '',
            tech: proj.tech || '',
            description: proj.description || '',
            githubUrl: proj.githubUrl || ''
          }))
        : [],
      certifications: Array.isArray(parsedResponse.parsedResume.certifications)
        ? parsedResponse.parsedResume.certifications.filter(c => c)
        : []
    };

    return {
      parsedResume: validatedResume,
      followUpQuestions: parsedResponse.followUpQuestions
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
    throw error;
  }
};

export default {
  parseAndAnalyzeResume
};
