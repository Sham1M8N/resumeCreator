import React from 'react';
import { ResumePDFDownload } from '../templates/ResumePDF';

const DownloadButton = ({ resumeData, disabled = false }) => {
  return (
    <div className="inline-block">
      <ResumePDFDownload 
        resumeData={resumeData} 
        disabled={disabled}
      />
    </div>
  );
};

export default DownloadButton;
