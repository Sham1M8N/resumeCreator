import React, { useState } from 'react';
import parseResumeText from '../utils/resumeParser';

const ResumeTextParser = ({ onParsed, onClose }) => {
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = () => {
    if (!resumeText.trim()) {
      return;
    }

    setIsParsing(true);
    
    // Simulate a small delay to show parsing state
    setTimeout(() => {
      const parsedData = parseResumeText(resumeText);
      setIsParsing(false);
      onParsed(parsedData);
    }, 500);
  };

  const handlePaste = (e) => {
    // Auto-parse when user pastes
    setTimeout(() => {
      const text = e.target.value;
      if (text.length > 100) {
        // Looks like a real resume, show hint
        // User can still click Parse button
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Auto-Fill from Resume</h2>
            <p className="text-sm text-gray-600 mt-1">
              Paste your resume text below and we'll extract the information automatically
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              onPaste={handlePaste}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none font-mono text-sm"
              placeholder="Paste your resume here...&#10;&#10;Include your name, contact information, work experience, skills, education, etc.&#10;&#10;Example:&#10;John Doe&#10;john@email.com | 555-123-4567&#10;LinkedIn: linkedin.com/in/johndoe&#10;&#10;SKILLS&#10;- JavaScript, React, Node.js&#10;&#10;WORK EXPERIENCE&#10;Software Engineer&#10;Company Name&#10;Jan 2020 - Present&#10;- Developed web applications..."
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
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for best results:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include clear section headers (WORK EXPERIENCE, SKILLS, EDUCATION)</li>
              <li>• Use bullet points (-) for achievements and responsibilities</li>
              <li>• Include dates in standard format (Jan 2020, 2020-2023, etc.)</li>
              <li>• Paste plain text (avoid copying from PDFs if possible)</li>
              <li>• You can edit the extracted information after parsing</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!resumeText.trim() || isParsing}
            className={`px-8 py-2 rounded-lg font-semibold text-white transition-colors ${
              resumeText.trim() && !isParsing
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isParsing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Parsing...
              </span>
            ) : (
              'Parse & Auto-Fill →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeTextParser;
