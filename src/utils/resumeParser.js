/**
 * Parse resume text and extract structured information
 * @param {string} resumeText - Raw resume text
 * @returns {Object} Parsed profile data
 */
export const parseResumeText = (resumeText) => {
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const profile = {
    fullName: '',
    email: '',
    phone: '',
    linkedIn: '',
    workExperiences: [],
    skills: [],
    education: []
  };

  // Extract email
  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    profile.email = emailMatch[0];
  }

  // Extract phone number (various formats)
  const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/);
  if (phoneMatch) {
    profile.phone = phoneMatch[0];
  }

  // Extract LinkedIn
  const linkedInMatch = resumeText.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedInMatch) {
    profile.linkedIn = `https://${linkedInMatch[0]}`;
  }

  // Extract name (usually first non-empty line or before contact info)
  const firstLine = lines[0];
  if (firstLine && !firstLine.includes('@') && !firstLine.includes('linkedin') && firstLine.length < 50) {
    profile.fullName = firstLine.replace(/[|]/g, '').trim();
  }

  // Extract skills section
  const skillsIndex = lines.findIndex(line => 
    line.toLowerCase().includes('skill') || 
    line.toLowerCase() === 'technical skills' ||
    line.toLowerCase() === 'skills'
  );
  
  if (skillsIndex !== -1) {
    // Look for skills in the next few lines
    for (let i = skillsIndex + 1; i < Math.min(skillsIndex + 15, lines.length); i++) {
      const line = lines[i];
      
      // Stop if we hit another section
      if (line.match(/^(WORK EXPERIENCE|EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS)/i)) {
        break;
      }
      
      // Extract skills from bullet points or comma-separated lists
      if (line.includes(':')) {
        const skillsPart = line.split(':')[1];
        const skills = skillsPart.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
        profile.skills.push(...skills);
      } else if (line.startsWith('-')) {
        const skillsPart = line.substring(1).trim();
        if (skillsPart.includes(':')) {
          const skills = skillsPart.split(':')[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
          profile.skills.push(...skills);
        }
      }
    }
  }

  // Extract work experience
  const expIndex = lines.findIndex(line => 
    line.toLowerCase().includes('work experience') || 
    line.toLowerCase().includes('experience') ||
    line.toLowerCase() === 'employment'
  );

  if (expIndex !== -1) {
    let currentExp = null;
    
    for (let i = expIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Stop if we hit education or projects section
      if (line.match(/^(EDUCATION|PROJECTS|CERTIFICATIONS|SKILLS)/i)) {
        if (currentExp) {
          profile.workExperiences.push(currentExp);
        }
        break;
      }
      
      // Detect job title line (usually standalone or followed by company)
      if (line && !line.startsWith('-') && !line.match(/^\d{4}/) && currentExp === null) {
        // This might be a job title
        currentExp = {
          title: line,
          company: '',
          startDate: '',
          endDate: '',
          bulletPoints: []
        };
      } else if (currentExp && !currentExp.company && !line.startsWith('-') && !line.match(/^\d{4}/)) {
        // This might be the company name
        currentExp.company = line;
      } else if (currentExp && line.match(/\d{4}/)) {
        // This might be the date range
        const dateMatch = line.match(/(\w+\s+\d{4})\s*[–-]\s*(\w+\s+\d{4}|Present)/i);
        if (dateMatch) {
          currentExp.startDate = dateMatch[1];
          currentExp.endDate = dateMatch[2];
        }
      } else if (currentExp && line.startsWith('-')) {
        // This is a bullet point
        currentExp.bulletPoints.push(line.substring(1).trim());
      } else if (line && !line.startsWith('-') && currentExp && currentExp.company && currentExp.bulletPoints.length > 0) {
        // New job starting
        profile.workExperiences.push(currentExp);
        currentExp = {
          title: line,
          company: '',
          startDate: '',
          endDate: '',
          bulletPoints: []
        };
      }
    }
    
    if (currentExp && currentExp.company) {
      profile.workExperiences.push(currentExp);
    }
  }

  // Extract education
  const eduIndex = lines.findIndex(line => 
    line.toLowerCase().includes('education') || 
    line.toLowerCase() === 'academic background'
  );

  if (eduIndex !== -1) {
    let currentEdu = null;
    
    for (let i = eduIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Stop if we hit projects or other section
      if (line.match(/^(PROJECTS|CERTIFICATIONS|WORK EXPERIENCE|SKILLS)/i)) {
        if (currentEdu) {
          profile.education.push(currentEdu);
        }
        break;
      }
      
      // Detect degree line
      if (line && !line.startsWith('-') && !line.match(/^\d{4}/) && 
          (line.toLowerCase().includes('bachelor') || 
           line.toLowerCase().includes('master') || 
           line.toLowerCase().includes('diploma') ||
           line.toLowerCase().includes('degree'))) {
        
        if (currentEdu) {
          profile.education.push(currentEdu);
        }
        
        currentEdu = {
          degree: line,
          institution: '',
          fieldOfStudy: '',
          graduationDate: ''
        };
      } else if (currentEdu && !currentEdu.institution && line && !line.startsWith('-') && !line.match(/^\d{4}/)) {
        // This might be the institution
        currentEdu.institution = line;
      } else if (currentEdu && line.match(/\d{4}/)) {
        // Extract graduation date
        const dateMatch = line.match(/\d{4}/g);
        if (dateMatch && dateMatch.length > 0) {
          currentEdu.graduationDate = dateMatch[dateMatch.length - 1];
        }
      }
    }
    
    if (currentEdu && currentEdu.institution) {
      profile.education.push(currentEdu);
    }
  }

  // If no skills found through structured parsing, try to find common skills
  if (profile.skills.length === 0) {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'React', 'Angular', 'Vue',
      'Node.js', 'Express', 'MongoDB', 'SQL', 'PostgreSQL', 'MySQL',
      'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Flutter', 'Dart', 'Swift', 'Kotlin', 'TypeScript',
      'WordPress', 'Canva', 'Figma'
    ];
    
    commonSkills.forEach(skill => {
      if (resumeText.toLowerCase().includes(skill.toLowerCase())) {
        profile.skills.push(skill);
      }
    });
  }

  return profile;
};

export default parseResumeText;
