import React from 'react';

const ResumePreview = ({ resumeData }) => {
  console.log('ResumePreview received:', resumeData);

  if (!resumeData) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
        <div className="text-center text-gray-400 py-12">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg">No resume data to preview</p>
          <p className="text-sm mt-2">Fill out your profile and tailor it to a job description</p>
        </div>
      </div>
    );
  }

  const { fullName, email, phone, linkedIn, summary, workExperiences, skills, education } = resumeData;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      {/* Header Section */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
          {email && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{phone}</span>
            </div>
          )}
          {linkedIn && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                LinkedIn
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {workExperiences && workExperiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
            Work Experience
          </h2>
          <div className="space-y-4">
            {workExperiences.map((experience, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {experience.title}
                    </h3>
                    <p className="text-lg text-gray-700 font-medium">
                      {experience.company}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>
                      {experience.startDate && formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
                    </p>
                  </div>
                </div>
                {experience.bulletPoints && experience.bulletPoints.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                    {experience.bulletPoints.map((bullet, bulletIndex) => (
                      bullet && (
                        <li key={bulletIndex} className="leading-relaxed">
                          {bullet}
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && skills.some(skill => skill) && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.filter(skill => skill).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </h3>
                    <p className="text-lg text-gray-700 font-medium">
                      {edu.institution}
                    </p>
                  </div>
                  {edu.graduationDate && (
                    <div className="text-right text-sm text-gray-600">
                      <p>{formatDate(edu.graduationDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section (if included from API) */}
      {resumeData.recommendations && resumeData.recommendations.length > 0 && (
        <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            💡 Recommendations
          </h3>
          <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
            {resumeData.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // If it's already in a readable format (e.g., "Present"), return as is
  if (isNaN(Date.parse(dateString))) {
    return dateString;
  }
  
  // Parse YYYY-MM format
  const [year, month] = dateString.split('-');
  if (year && month) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  
  return dateString;
};

export default ResumePreview;
