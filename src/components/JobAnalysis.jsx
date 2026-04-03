import React, { useState } from 'react';

const JobAnalysis = ({ analysisData }) => {
  const [tooltipVisibility, setTooltipVisibility] = useState({});

  if (!analysisData) {
    return null;
  }

  const { matchScore = 0, matchedKeywords = [], missingKeywords = [], suggestions = [] } = analysisData;

  // Determine score colors
  const getScoreColor = (score) => {
    if (score >= 70) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const getScoreClasses = (score) => {
    if (score >= 70) return 'bg-green-100 border-green-300 text-green-800';
    if (score >= 50) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const getMatchLabel = (score) => {
    if (score >= 70) return '✓ Excellent Match';
    if (score >= 50) return '~ Good Match';
    return '! Needs Improvement';
  };

  const toggleTooltip = (index) => {
    setTooltipVisibility(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const scoreClasses = getScoreClasses(matchScore);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200 mb-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Job Analysis Results</h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Score Section - Center */}
        <div className="col-span-1 flex flex-col items-center justify-start">
          <div className={`w-40 h-40 rounded-full border-6 flex flex-col items-center justify-center ${scoreClasses} shadow-md`}>
            <div className="text-5xl font-bold">{matchScore}</div>
            <div className="text-sm font-medium mt-1">/ 100</div>
          </div>
          <p className="text-lg font-semibold text-gray-700 mt-6 text-center">
            {getMatchLabel(matchScore)}
          </p>
          <p className="text-sm text-gray-600 mt-3 text-center text-center">
            {matchScore >= 70
              ? "Your resume aligns well with this role"
              : matchScore >= 50
              ? "Your resume matches some requirements"
              : "Consider improving your qualifications for this role"}
          </p>
        </div>

        {/* Keywords Sections */}
        <div className="col-span-2 space-y-6">
          {/* Keywords You Have */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">✓</span>
              Keywords You Have
            </h3>
            {matchedKeywords && matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300 shadow-sm hover:shadow-md transition"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">No matched keywords found. Consider updating your resume with relevant skills.</p>
            )}
          </div>

          {/* Keywords to Add */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">!</span>
              Keywords to Add
            </h3>
            {missingKeywords && missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, index) => (
                  <div key={index} className="relative inline-block group">
                    <button
                      onClick={() => toggleTooltip(index)}
                      onMouseEnter={() => setTooltipVisibility(prev => ({ ...prev, [index]: true }))}
                      onMouseLeave={() => setTooltipVisibility(prev => ({ ...prev, [index]: false }))}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300 shadow-sm hover:shadow-md transition cursor-help relative"
                    >
                      {keyword}
                      <span className="ml-2 text-red-600">ℹ</span>
                    </button>
                    {tooltipVisibility[index] && (
                      <div className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                        These appear in the job description but not your resume
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm italic">Great! You have all the main keywords from the job description.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestions Section */}
      {suggestions && suggestions.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">💡</span>
            AI Suggestions to Improve Your Match
          </h3>
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg hover:shadow-md transition"
              >
                <p className="text-gray-800">
                  <span className="font-semibold text-blue-700">Tip {index + 1}:</span> {suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAnalysis;
