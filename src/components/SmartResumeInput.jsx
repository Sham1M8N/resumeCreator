import React, { useState } from 'react';
import { parseAndAnalyzeResume } from '../services/resumeParserService';

const SmartResumeInput = ({ onResumeReady, onClose }) => {
  const [stage, setStage] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // Stage 1: Parse and Analyze
  const handleParseAndAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseAndAnalyzeResume(resumeText);
      setParsedData(result.parsedResume);
      setFollowUpQuestions(result.followUpQuestions || []);
      
      // Initialize answers object with empty strings
      const initialAnswers = {};
      result.followUpQuestions.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
      
      setStage(2);
    } catch (err) {
      console.error('Error parsing resume:', err);
      setError(err.message || 'Failed to parse resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stage 2: Handle answer changes
  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleSkipQuestion = (index) => {
    setAnswers(prev => ({
      ...prev,
      [index]: ''
    }));
  };

  // Stage 2 to Stage 3: Continue to Resume
  const handleContinueToResume = () => {
    // Combine parsed data with answered questions
    const enrichedProfile = {
      ...parsedData,
      // Add answered questions as additional context
      additionalInfo: Object.entries(answers)
        .filter(([_, answer]) => answer.trim().length > 0)
        .map(([index, answer]) => ({
          question: followUpQuestions[parseInt(index)],
          answer: answer
        }))
    };

    // Emit the final profile
    if (onResumeReady) {
      onResumeReady(enrichedProfile);
    }
    setStage(3);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Resume Parser</h2>
            <p className="text-sm text-gray-600 mt-1">
              {stage === 1 && 'Paste your resume and let AI analyze it'}
              {stage === 2 && 'Answer a few questions to strengthen your resume'}
              {stage === 3 && 'Processing complete!'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <div className={`flex items-center ${stage >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                stage >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Parse</span>
            </div>
            <div className={`w-16 h-1 ${stage >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${stage >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                stage >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Enhance</span>
            </div>
            <div className={`w-16 h-1 ${stage >= 3 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${stage >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                stage >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
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

          {/* Stage 1: Paste Resume */}
          {stage === 1 && !isLoading && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Your Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none font-mono text-sm"
                placeholder="Paste your complete resume here...&#10;&#10;Include all sections: contact info, summary, work experience, education, skills, projects, etc."
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  {resumeText.length} characters
                </p>
                <button
                  onClick={() => setResumeText('')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• AI will extract and structure your resume information</li>
                  <li>• Identify missing details or areas for improvement</li>
                  <li>• Ask targeted questions to strengthen your resume</li>
                  <li>• Generate an optimized profile ready for job matching</li>
                </ul>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin h-16 w-16 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing your resume...</h3>
              <p className="text-gray-600 text-center max-w-md">
                Our AI is parsing your information and identifying opportunities to strengthen your resume.
                This may take 10-20 seconds.
              </p>
            </div>
          )}

          {/* Stage 2: Follow-up Questions */}
          {stage === 2 && !isLoading && (
            <div>
              {/* Success Banner */}
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-green-800 font-medium">Resume parsed successfully!</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Please answer a few questions to strengthen it. You can skip any question.
                    </p>
                  </div>
                </div>
              </div>

              {/* Follow-up Questions */}
              {followUpQuestions.length > 0 ? (
                <div className="space-y-6">
                  {followUpQuestions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <label className="block text-sm font-medium text-gray-800">
                          <span className="inline-block w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-2">
                            {index + 1}
                          </span>
                          {question}
                        </label>
                        <button
                          onClick={() => handleSkipQuestion(index)}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Skip
                        </button>
                      </div>
                      <input
                        type="text"
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Your answer (optional)..."
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>No additional questions needed. Your resume looks great!</p>
                </div>
              )}
            </div>
          )}

          {/* Stage 3: Complete */}
          {stage === 3 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h3>
              <p className="text-gray-600 text-center max-w-md">
                Your resume has been successfully parsed and enhanced. You can now view and edit your profile.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          
          {stage === 1 && !isLoading && (
            <button
              onClick={handleParseAndAnalyze}
              disabled={!resumeText.trim()}
              className={`px-8 py-2 rounded-lg font-semibold text-white transition-colors ${
                resumeText.trim()
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Parse & Analyze →
            </button>
          )}

          {stage === 2 && (
            <button
              onClick={handleContinueToResume}
              className="px-8 py-2 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors"
            >
              Continue to Resume →
            </button>
          )}

          {stage === 3 && (
            <button
              onClick={onClose}
              className="px-8 py-2 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartResumeInput;
