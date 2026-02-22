import React, { useState } from 'react';
import { ProfileForm, JobInput, ResumePreview, DownloadButton, SmartResumeInput, JobAnalysis } from './components';
import { useProfile } from './hooks';
import { tailorResumeToJob } from './services/jobTargetingService';
import './App.css';

function App() {
  const { profile, setProfile } = useProfile();
  // Check if profile exists on load and skip to Step 2 if it does
  const [currentStep, setCurrentStep] = useState(() => {
    if (profile) {
      console.log('Profile found in localStorage on load, skipping to Step 2 (JobInput)');
      return 2;
    }
    return 0;
  });
  const [showSmartParser, setShowSmartParser] = useState(false);
  const [tailoredData, setTailoredData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle profile changes from ProfileForm
  const handleProfileChange = (profileData) => {
    setProfile(profileData);
  };

  // Handle smart resume parser completion
  const handleSmartResumeReady = (enrichedProfile) => {
    console.log('SmartResumeInput completed, resumeData:', enrichedProfile);
    setProfile(enrichedProfile);
    setShowSmartParser(false);
    setCurrentStep(2); // Skip to Step 2 (JobInput)
  };

  // Handle job description submission
  const handleJobSubmit = async (jobDescription) => {
    if (!profile) {
      setError('Please complete your profile first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call tailorResumeToJob which analyzes the job and returns detailed match data
      const result = await tailorResumeToJob(profile, jobDescription);
      console.log('Raw API response:', result);
      setTailoredData(result);
      setCurrentStep(3);
    } catch (err) {
      console.error('Error tailoring resume:', err);
      setError(err.message || 'Failed to tailor resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === 1 && !profile) {
      setError('Please fill out your profile before continuing');
      return;
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  // Start over
  const handleStartOver = () => {
    setCurrentStep(0);
    setTailoredData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Smart Resume Input Modal */}
      {showSmartParser && (
        <SmartResumeInput 
          onResumeReady={handleSmartResumeReady}
          onClose={() => setShowSmartParser(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Generator</h1>
              <p className="text-gray-600 mt-1">AI-powered resume tailoring for your dream job</p>
            </div>
            {currentStep > 0 && (
              <button
                onClick={handleStartOver}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {currentStep > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center mb-8">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
              currentStep >= 1 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              1
            </div>
            <span className={`ml-2 font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              Your Profile
            </span>
          </div>

          {/* Connector */}
          <div className={`w-24 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>

          {/* Step 2 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
              currentStep >= 2 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              2
            </div>
            <span className={`ml-2 font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              Job Description
            </span>
          </div>

          {/* Connector */}
          <div className={`w-24 h-1 mx-4 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>

          {/* Step 3 */}
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
              currentStep >= 3 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              3
            </div>
            <span className={`ml-2 font-medium ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
              Tailored Resume
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-4xl mx-auto mb-6 p-8 bg-white shadow-lg rounded-lg">
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Tailoring Your Resume...</h3>
              <p className="text-gray-600 text-center">
                Our AI is analyzing the job description and optimizing your resume to match the requirements.
                <br />
                This may take a few moments.
              </p>
            </div>
          </div>
        )}

        {/* Step Content */}
        {!isLoading && (
          <>
            {/* Step 1: Profile Form */}
            {currentStep === 1 && (
              <div>
                <ProfileForm 
                  onProfileChange={handleProfileChange}
                  initialData={profile}
                />
                <div className="max-w-4xl mx-auto mt-6 flex justify-end">
                  <button
                    onClick={goToNextStep}
                    disabled={!profile}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                      profile 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Continue to Job Description →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Job Input */}
            {currentStep === 2 && (
              <div>
                <JobInput onSubmit={handleJobSubmit} />
                <div className="max-w-4xl mx-auto mt-6 flex justify-between">
                  <button
                    onClick={goToPreviousStep}
                    className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    ← Back to Profile
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Resume Preview and Download */}
            {currentStep === 3 && tailoredData && (
              <div>
                {/* Merge tailored resume data with original profile to preserve personal info and education */}
                {(() => {
                  const finalResume = { 
                    fullName: profile.fullName, 
                    email: profile.email, 
                    phone: profile.phone, 
                    linkedIn: profile.linkedIn, 
                    github: profile.github, 
                    location: profile.location, 
                    education: [
                      {
                        institution: 'Universiti Kuala Lumpur Malaysian Institute of Information Technology (UniKL MIIT)',
                        degree: 'Bachelor of Information Technology (Hons) in Software Engineering',
                        startDate: 'March 2024',
                        graduationDate: 'December 2027',
                        gpa: '3.62',
                        highlights: [
                          'Dean\'s List — October 2024 and October 2025 semesters',
                          'Relevant Coursework: Software Design, Mobile App Development, Web Technologies',
                          'Member, Google Developer Student Clubs (GDSC) — UniKL MIIT'
                        ]
                      },
                      {
                        institution: 'Politeknik Ungku Omar (PUO)',
                        degree: 'Diploma in Information Technology in Digital Technology',
                        startDate: 'December 2019',
                        graduationDate: 'July 2022',
                        gpa: '3.43',
                        highlights: [
                          'Final Year Project: Augmented Reality app for interactive learning using Unity'
                        ]
                      }
                    ],
                    summary: tailoredData?.resumeData?.summary || tailoredData?.summary || profile.summary, 
                    workExperiences: tailoredData?.resumeData?.workExperiences || tailoredData?.workExperiences || profile.workExperiences, 
                    skills: profile.skills, 
                    projects: tailoredData?.resumeData?.projects || tailoredData?.projects || profile.projects, 
                    certifications: [
                      'Google Project Management Professional Certificate (Google, Coursera) — Credential ID: H5Y6MLEYJKLD'
                    ]
                  };
                  console.log('Final resume object:', finalResume);
                  
                  return (
                    <>
                      <div className="print:hidden mb-6 max-w-4xl mx-auto">
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <h3 className="text-green-800 font-medium">Resume Tailored Successfully!</h3>
                              <p className="text-green-700 text-sm mt-1">
                                Your resume has been optimized for the job description. Review the analysis and your tailored resume below.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job Analysis Component - Shows match score and keywords */}
                      <JobAnalysis 
                        analysisData={{
                          matchScore: tailoredData.matchScore,
                          matchedKeywords: tailoredData.matchedKeywords,
                          missingKeywords: tailoredData.missingKeywords,
                          suggestions: tailoredData.suggestions || []
                        }}
                      />

                      <ResumePreview resumeData={finalResume} />
                      
                      <div className="max-w-4xl mx-auto mt-6 print:hidden">
                        <div className="flex justify-between items-center mb-4">
                          <button
                            onClick={goToPreviousStep}
                            className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            ← Try Another Job
                          </button>
                          <DownloadButton resumeData={finalResume} />
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <p className="text-sm text-blue-800">
                            💡 <strong>Tip:</strong> The downloaded resume is ATS-optimized with a single-column layout, standard fonts, and no graphics - perfect for Applicant Tracking Systems.
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* Landing Page for Step 0 */}
      {currentStep === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How would you like to start?
              </h2>
              <p className="text-xl text-gray-600">
                Choose the method that works best for you
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Smart Resume Input Card */}
              <div
                onClick={() => setShowSmartParser(true)}
                className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500 transform hover:-translate-y-2"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors duration-300">
                    <svg className="w-10 h-10 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Paste Existing Resume
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Have a resume already? Let AI parse and analyze it instantly. We'll extract all your information and ask smart questions to strengthen it.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      AI-powered parsing
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Smart follow-up questions
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Fastest option
                    </div>
                  </div>
                  <div className="mt-6 px-6 py-2 bg-purple-500 text-white rounded-lg font-semibold group-hover:bg-purple-600 transition-colors duration-300">
                    Get Started →
                  </div>
                </div>
              </div>

              {/* Build From Scratch Card */}
              <div
                onClick={() => setCurrentStep(1)}
                className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-2"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors duration-300">
                    <svg className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Build From Scratch
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Starting fresh? Fill out your profile step-by-step with our guided form. Perfect for creating your first resume or starting over.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Step-by-step guidance
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Full control over details
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Best for beginners
                    </div>
                  </div>
                  <div className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold group-hover:bg-blue-600 transition-colors duration-300">
                    Get Started →
                  </div>
                </div>
              </div>
              {/* Continue with Saved Profile Card - Only show if profile exists */}
              {profile && (
                <div
                  onClick={() => setCurrentStep(2)}
                  className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-2"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors duration-300">
                      <svg className="w-10 h-10 text-green-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Continue with Saved Profile
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Welcome back! We found your profile from your last session. Pick a new job and get your resume tailored instantly.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Profile ready to use
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Skip to job tailoring
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Quickest option
                      </div>
                    </div>
                    <div className="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg font-semibold group-hover:bg-green-600 transition-colors duration-300">
                      Continue →
                    </div>
                  </div>
                </div>
              )}            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2026 Resume Generator. Powered by AI to help you land your dream job.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
