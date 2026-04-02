import React, { useState } from 'react';

const JobInput = ({ onSubmit, matchPreview = null }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const job = jobDescription.trim() || jobUrl.trim();
    if (!job) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(job);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Allow Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Determine score badge color
  const getScoreBadgeColor = (score) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const jobInput = jobDescription.trim() || jobUrl.trim();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Job Description</h2>
      <p className="text-gray-600 mb-6">
        Paste the job description or URL below, and we'll tailor your resume to match the position.
      </p>

      {/* Two Column Input Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Option 1: Direct Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Option 1: Paste Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-y"
            placeholder="Paste the full job description here...&#10;&#10;Include job title, responsibilities, requirements, and qualifications."
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              {jobDescription.length} characters
            </p>
          </div>
        </div>

        {/* Option 2: Job URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Option 2: Job URL (reference only)
          </label>
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            className="w-full h-11 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-2"
            placeholder="https://linkedin.com/jobs/..."
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Saved for your reference only. Paste the full job description in the text box above.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!jobInput || isSubmitting}
        className="w-full py-3 px-6 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Tailoring Your Resume...
          </span>
        ) : (
          'Tailor My Resume'
        )}
      </button>

      {!jobInput && (
        <p className="text-sm text-amber-600 mt-4 text-center">
          Please paste a job description or URL to continue
        </p>
      )}

      {/* Match Preview Section */}
      {matchPreview && (
        <div className="mt-8 border-t pt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Resume Match Analysis</h3>

          {/* Score Badge */}
          <div className="mb-8 flex items-center gap-6">
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${getScoreBadgeColor(matchPreview.matchScore)}`}>
              <div className="text-center">
                <div className="text-4xl font-bold">{matchPreview.matchScore}</div>
                <div className="text-sm font-medium">/ 100</div>
              </div>
            </div>
            <div>
              <p className="text-gray-700 font-medium mb-2">
                {matchPreview.matchScore >= 70
                  ? '✓ Excellent Match'
                  : matchPreview.matchScore >= 50
                  ? '~ Good Match'
                  : '! Consider Adjustments'}
              </p>
              <p className="text-gray-600 text-sm">
                {matchPreview.matchScore >= 70
                  ? "Your resume aligns well with this job posting. You're ready to apply!"
                  : matchPreview.matchScore >= 50
                  ? 'Your resume matches some key requirements. Consider adding the missing skills below.'
                  : 'Your resume needs significant updates to match this role. Review the missing keywords.'}
              </p>
            </div>
          </div>

          {/* Matched Keywords */}
          {matchPreview.matchedKeywords && matchPreview.matchedKeywords.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">✓ Matched Keywords</p>
              <div className="flex flex-wrap gap-2">
                {matchPreview.matchedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {matchPreview.missingKeywords && matchPreview.missingKeywords.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Consider adding these to your resume
              </p>
              <div className="flex flex-wrap gap-2">
                {matchPreview.missingKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobInput;
