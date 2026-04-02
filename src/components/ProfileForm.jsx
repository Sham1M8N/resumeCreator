import React, { useState, useEffect, useRef } from 'react';
import ResumeTextParser from './ResumeTextParser';

const ProfileForm = ({ onProfileChange, initialData }) => {
  const data = initialData || {};
  const [showParser, setShowParser] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    linkedIn: data.linkedIn || '',
    workExperiences: data.workExperiences || [
      { company: '', title: '', startDate: '', endDate: '', bulletPoints: [''] }
    ],
    skills: data.skills || [''],
    education: data.education || [
      { institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }
    ]
  });

  // Debounce profile saves — avoid writing to localStorage on every keystroke
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (!onProfileChange) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onProfileChange(profileData);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [profileData, onProfileChange]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Work Experience Handlers
  const handleWorkExperienceChange = (index, field, value) => {
    const updatedExperiences = [...profileData.workExperiences];
    updatedExperiences[index][field] = value;
    setProfileData(prev => ({
      ...prev,
      workExperiences: updatedExperiences
    }));
  };

  const handleBulletPointChange = (expIndex, bulletIndex, value) => {
    const updatedExperiences = [...profileData.workExperiences];
    updatedExperiences[expIndex].bulletPoints[bulletIndex] = value;
    setProfileData(prev => ({
      ...prev,
      workExperiences: updatedExperiences
    }));
  };

  const addBulletPoint = (expIndex) => {
    const updatedExperiences = [...profileData.workExperiences];
    updatedExperiences[expIndex].bulletPoints.push('');
    setProfileData(prev => ({
      ...prev,
      workExperiences: updatedExperiences
    }));
  };

  const removeBulletPoint = (expIndex, bulletIndex) => {
    const updatedExperiences = [...profileData.workExperiences];
    updatedExperiences[expIndex].bulletPoints.splice(bulletIndex, 1);
    setProfileData(prev => ({
      ...prev,
      workExperiences: updatedExperiences
    }));
  };

  const addWorkExperience = () => {
    setProfileData(prev => ({
      ...prev,
      workExperiences: [
        ...prev.workExperiences,
        { company: '', title: '', startDate: '', endDate: '', bulletPoints: [''] }
      ]
    }));
  };

  const removeWorkExperience = (index) => {
    const updatedExperiences = profileData.workExperiences.filter((_, i) => i !== index);
    setProfileData(prev => ({
      ...prev,
      workExperiences: updatedExperiences
    }));
  };

  // Skills Handlers
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...profileData.skills];
    updatedSkills[index] = value;
    setProfileData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const addSkill = () => {
    setProfileData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index) => {
    const updatedSkills = profileData.skills.filter((_, i) => i !== index);
    setProfileData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  // Education Handlers
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...profileData.education];
    updatedEducation[index][field] = value;
    setProfileData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addEducation = () => {
    setProfileData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }
      ]
    }));
  };

  const removeEducation = (index) => {
    const updatedEducation = profileData.education.filter((_, i) => i !== index);
    setProfileData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const handleParsedData = (parsedData) => {
    // Merge parsed data with existing data
    setProfileData(prev => ({
      fullName: parsedData.fullName || prev.fullName,
      email: parsedData.email || prev.email,
      phone: parsedData.phone || prev.phone,
      linkedIn: parsedData.linkedIn || prev.linkedIn,
      workExperiences: parsedData.workExperiences.length > 0 
        ? parsedData.workExperiences 
        : prev.workExperiences,
      skills: parsedData.skills.length > 0 
        ? parsedData.skills 
        : prev.skills,
      education: parsedData.education.length > 0 
        ? parsedData.education 
        : prev.education
    }));
    setShowParser(false);
  };

  return (
    <>
      {showParser && (
        <ResumeTextParser 
          onParsed={handleParsedData}
          onClose={() => setShowParser(false)}
        />
      )}
      
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Profile Information</h2>
            <p className="text-gray-600 text-sm mt-1">Fill out your details or auto-import from your resume</p>
          </div>
          <button
            onClick={() => setShowParser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Import from Resume
          </button>
        </div>
        
        {/* Personal Information Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={profileData.linkedIn}
              onChange={(e) => handleInputChange('linkedIn', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>
        </div>
      </div>

      {/* Work Experience Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-semibold text-gray-700">Work Experience</h3>
          <button
            onClick={addWorkExperience}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            + Add Experience
          </button>
        </div>

        {profileData.workExperiences.map((experience, expIndex) => (
          <div key={expIndex} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium text-gray-800">Experience {expIndex + 1}</h4>
              {profileData.workExperiences.length > 1 && (
                <button
                  onClick={() => removeWorkExperience(expIndex)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) => handleWorkExperienceChange(expIndex, 'company', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={experience.title}
                  onChange={(e) => handleWorkExperienceChange(expIndex, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => handleWorkExperienceChange(expIndex, 'startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="month"
                  value={experience.endDate}
                  onChange={(e) => handleWorkExperienceChange(expIndex, 'endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Present"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities & Achievements
              </label>
              {experience.bulletPoints.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex gap-2 mb-2">
                  <textarea
                    value={bullet}
                    onChange={(e) => handleBulletPointChange(expIndex, bulletIndex, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    rows="2"
                    placeholder="Describe your responsibilities and achievements..."
                  />
                  {experience.bulletPoints.length > 1 && (
                    <button
                      onClick={() => removeBulletPoint(expIndex, bulletIndex)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addBulletPoint(expIndex)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2"
              >
                + Add Bullet Point
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-semibold text-gray-700">Skills</h3>
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            + Add Skill
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="e.g., JavaScript, React, Node.js"
              />
              {profileData.skills.length > 1 && (
                <button
                  onClick={() => removeSkill(index)}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-semibold text-gray-700">Education</h3>
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            + Add Education
          </button>
        </div>

        {profileData.education.map((edu, eduIndex) => (
          <div key={eduIndex} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium text-gray-800">Education {eduIndex + 1}</h4>
              {profileData.education.length > 1 && (
                <button
                  onClick={() => removeEducation(eduIndex)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution *
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(eduIndex, 'institution', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="University Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree *
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(eduIndex, 'degree', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Bachelor of Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={edu.fieldOfStudy}
                  onChange={(e) => handleEducationChange(eduIndex, 'fieldOfStudy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Computer Science"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Graduation Date
                </label>
                <input
                  type="month"
                  value={edu.graduationDate}
                  onChange={(e) => handleEducationChange(eduIndex, 'graduationDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default ProfileForm;
