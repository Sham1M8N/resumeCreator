const PARSE_API_URL = '/api/parse';

/**
 * Parse and analyze resume text using AI
 * @param {string} rawResumeText - Raw resume text to parse
 * @returns {Promise<Object>} Object with parsedResume and followUpQuestions
 */
export const parseAndAnalyzeResume = async (rawResumeText) => {
  if (!rawResumeText || rawResumeText.trim().length === 0) {
    throw new Error('Resume text is required.');
  }

  try {
    const response = await fetch(PARSE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawResumeText })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to parse resume. Please try again.');
    }

    const parsedResponse = await response.json();
    
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

const resumeParserService = { parseAndAnalyzeResume };
export default resumeParserService;
