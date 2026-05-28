import React, { useState } from 'react';
import { buildShareUrl } from '../utils/shareResume';

const ShareResumeButton = ({ finalResume }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const url = buildShareUrl(finalResume);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors flex items-center gap-2 ${
          copied
            ? 'bg-green-50 border-2 border-green-300 text-green-700'
            : 'text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50'
        }`}
      >
        {copied ? (
          'Link Copied!'
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Resume
          </>
        )}
      </button>
      {finalResume.profilePicture && (
        <p className="text-xs text-gray-500 text-center mt-1">
          Profile photo not included in shared link
        </p>
      )}
    </div>
  );
};

export default ShareResumeButton;
