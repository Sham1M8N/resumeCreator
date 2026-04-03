import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  // Header/Contact Section
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 10,
    marginBottom: 16,
    color: '#333',
  },
  // Section Headings
  sectionHeading: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
  },
  // Professional Summary
  summaryText: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  // Work Experience
  experienceItem: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  company: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  dates: {
    fontSize: 10,
    color: '#555',
    marginBottom: 4,
  },
  bulletPoint: {
    fontSize: 10,
    marginBottom: 3,
    marginLeft: 12,
  },
  // Skills
  skillsContainer: {
    marginBottom: 12,
  },
  skillItem: {
    fontSize: 10,
    marginBottom: 2,
  },
  // Education
  educationItem: {
    marginBottom: 10,
  },
  degree: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  institution: {
    fontSize: 10,
    marginBottom: 2,
  },
  graduationDate: {
    fontSize: 10,
    color: '#555',
  },
  // Projects
  projectItem: {
    marginBottom: 12,
  },
  projectName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  tech: {
    fontSize: 10,
    fontFamily: 'Helvetica-Oblique',
    color: '#555',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 10,
    marginBottom: 2,
  },
  githubUrl: {
    fontSize: 10,
    color: '#555',
  },
  // Certifications
  certificationItem: {
    fontSize: 10,
    marginBottom: 2,
  },
  // Error Messages
  errorText: {
    fontSize: 10,
    color: '#DC2626',
    marginBottom: 8,
  },
});

// PDF Document Component
const ResumePDFDocument = ({ resumeData }) => {
  const {
    fullName = '',
    email = '',
    phone = '',
    linkedIn = '',
    github = '',
    location = '',
    summary = '',
    workExperiences = [],
    skills = [],
    education = [],
    projects = [],
    certifications = []
  } = resumeData || {};

  // Format date helper - convert to "Month Year" format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const normalizedDate = dateString.toLowerCase().trim();
    
    if (normalizedDate === 'present' || normalizedDate.includes('present')) {
      return 'Present';
    }

    // Month names mapping
    const monthMap = {
      'january': 'January', 'february': 'February', 'march': 'March', 'april': 'April',
      'may': 'May', 'june': 'June', 'july': 'July', 'august': 'August',
      'september': 'September', 'october': 'October', 'november': 'November', 'december': 'December',
      'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
      'jun': 'June', 'jul': 'July', 'aug': 'August',
      'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
    };

    // Try to parse YYYY-MM format
    const dateRegex = /(\d{4})-(\d{2})/;
    const match = dateString.match(dateRegex);
    if (match) {
      const year = match[1];
      const monthNum = parseInt(match[2], 10);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[monthNum - 1]} ${year}`;
    }

    // Try to parse formats like "Mar 2022" or "March 2022"
    for (const [shortMonth, fullMonth] of Object.entries(monthMap)) {
      if (normalizedDate.includes(shortMonth)) {
        const yearMatch = dateString.match(/(\d{4})/);
        if (yearMatch) {
          return `${fullMonth} ${yearMatch[1]}`;
        }
      }
    }

    // If already in "Month Year" format, return as is
    const monthYearRegex = /([A-Za-z]+)\s+(\d{4})/;
    const monthYearMatch = dateString.match(monthYearRegex);
    if (monthYearMatch) {
      const month = monthYearMatch[1];
      const year = monthYearMatch[2];
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
      return `${capitalizedMonth} ${year}`;
    }

    // Fallback - return original
    return dateString;
  };


  // Helper function to check if a field is empty, undefined, or has placeholder value
  const isMissingField = (value) => {
    return !value || value.trim() === '' || value === 'Your Name';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Contact Information */}
        <View>
          {isMissingField(fullName) ? (
            <Text style={styles.errorText}>ERROR: Name not found in parsed data</Text>
          ) : (
            <Text style={styles.name}>{fullName}</Text>
          )}
          
          <View style={{ marginBottom: 16 }}>
            {isMissingField(email) && (
              <Text style={styles.errorText}>ERROR: Email not found in parsed data</Text>
            )}
            {isMissingField(phone) && (
              <Text style={styles.errorText}>ERROR: Phone not found in parsed data</Text>
            )}
          </View>
          
          {!isMissingField(email) || !isMissingField(phone) || linkedIn || github || location ? (
            <Text style={styles.contactInfo}>
              {[email, phone, linkedIn, github, location].filter(Boolean).join(' | ')}
            </Text>
          ) : null}
        </View>

        {/* Professional Summary */}
        {summary && (
          <View>
            <Text style={styles.sectionHeading}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {workExperiences && workExperiences.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>WORK EXPERIENCE</Text>
            {workExperiences.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.jobTitle}>{exp.title || 'Job Title'}</Text>
                <Text style={styles.company}>{exp.company || 'Company Name'}</Text>
                <Text style={styles.dates}>
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                </Text>
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <View>
                    {exp.bulletPoints.map((bullet, bulletIndex) => (
                      bullet && (
                        <Text key={bulletIndex} style={styles.bulletPoint}>
                          • {bullet}
                        </Text>
                      )
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>SKILLS</Text>
            <Text style={styles.skillItem}>
              {skills.filter(s => s).join(' • ')}
            </Text>
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>EDUCATION</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>
                  {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                </Text>
                <Text style={styles.institution}>{edu.institution}</Text>
                {edu.startDate && edu.graduationDate && (
                  <Text style={styles.dates}>
                    {formatDate(edu.startDate)} - {formatDate(edu.graduationDate)}
                  </Text>
                )}
                {edu.gpa && (
                  <Text style={styles.institution}>GPA: {edu.gpa}</Text>
                )}
                {edu.highlights && edu.highlights.length > 0 && (
                  <View>
                    {edu.highlights.map((highlight, highlightIndex) => (
                      highlight && (
                        <Text key={highlightIndex} style={styles.bulletPoint}>
                          • {highlight}
                        </Text>
                      )
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>PROJECTS</Text>
            {projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.name || 'Project Name'}</Text>
                {project.tech && (
                  <Text style={styles.tech}>
                    Tech Stack: {project.tech}
                  </Text>
                )}
                {project.description && (
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>
                )}
                {project.githubUrl && (
                  <Text style={styles.githubUrl}>
                    GitHub: {project.githubUrl}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && certifications.some(cert => cert) && (
          <View>
            <Text style={styles.sectionHeading}>CERTIFICATIONS</Text>
            <View style={styles.skillsContainer}>
              {certifications.filter(cert => cert).map((cert, index) => (
                <Text key={index} style={styles.certificationItem}>
                  • {cert}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

// Export the download component with styled button
export const ResumePDFDownload = ({ resumeData, disabled = false }) => {
  const fileName = resumeData?.fullName 
    ? `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`
    : 'Resume.pdf';

  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: disabled ? '#d1d5db' : '#10b981',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '14px',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: 'background-color 0.2s',
  };

  const buttonHoverStyles = {
    backgroundColor: '#059669',
  };

  if (!resumeData || disabled) {
    return (
      <button style={buttonStyles} disabled>
        Download ATS Resume (PDF)
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ResumePDFDocument resumeData={resumeData} />}
      fileName={fileName}
      style={buttonStyles}
    >
      {({ blob, url, loading, error }) => {
        if (loading) {
          return 'Generating PDF...';
        }
        if (error) {
          return 'Error generating PDF';
        }
        return (
          <>
            <svg 
              style={{ width: '20px', height: '20px' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Download ATS Resume (PDF)
          </>
        );
      }}
    </PDFDownloadLink>
  );
};

export default ResumePDFDocument;
