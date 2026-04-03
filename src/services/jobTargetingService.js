const TAILOR_API_URL = '/api/tailor';

/**
 * Tailors a resume to a specific job description by analyzing job requirements,
 * rewriting content, and identifying matched/missing keywords
 * @param {Object} profileData - The user's profile data (all resume sections)
 * @param {string} jobDescription - The job description to tailor the resume for
 * @returns {Promise<Object>} Tailored resume with match analysis
 */
export const tailorResumeToJob = async (profileData, jobDescription) => {
  if (!profileData || !jobDescription) {
    throw new Error('Both profileData and jobDescription are required.');
  }

  try {
    const response = await fetch(TAILOR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileData, jobDescription })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) throw new Error('Too many requests. Please wait a moment and try again.');
      if (response.status >= 500) throw new Error('The AI service is temporarily unavailable. Please try again later.');
      throw new Error(errorData.error || 'Failed to tailor resume. Please try again.');
    }

    const parsedResponse = await response.json();
    
    // Validate required fields
    const requiredFields = ['summary', 'workExperiences', 'skills', 'education', 'projects', 'matchedKeywords', 'missingKeywords', 'matchScore', 'suggestions'];
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
      matchScore: matchScore,
      suggestions: Array.isArray(parsedResponse.suggestions)
        ? parsedResponse.suggestions.filter(s => s)
        : []
    };

    return validatedResponse;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
    throw error;
  }
};

const jobTargetingService = { tailorResumeToJob };
export default jobTargetingService;
