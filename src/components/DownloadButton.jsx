import React from 'react';
import { ResumePDFDownload } from '../templates/ResumePDF';

const DownloadButton = ({ resumeData, template = 'classic', disabled = false }) => {
  return (
    <div className="inline-block">
      <ResumePDFDownload
        resumeData={resumeData}
        template={template}
        disabled={disabled}
      />
    </div>
  );
};

export default DownloadButton;
