import React, { useState, useEffect } from 'react';
import { generateCoverLetter } from '../services/coverLetterService';
import { createCheckoutSession } from '../services/paymentService';

const COVER_LETTER_KEY = 'resume_cover_letter_uses';
const MAX_FREE = 3;

const getUsesRemaining = () => {
  return MAX_FREE - (parseInt(localStorage.getItem(COVER_LETTER_KEY) || '0', 10));
};

const incrementUse = () => {
  const current = parseInt(localStorage.getItem(COVER_LETTER_KEY) || '0', 10);
  localStorage.setItem(COVER_LETTER_KEY, String(current + 1));
};

const CoverLetterModal = ({ isOpen, onClose, profileData, jobDescription, matchedKeywords, isPaid }) => {
  const [coverLetter, setCoverLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [usesRemaining, setUsesRemaining] = useState(MAX_FREE);

  useEffect(() => {
    if (isOpen) {
      setUsesRemaining(getUsesRemaining());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCoverLetter(null);
      setIsLoading(false);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCoverLetter(profileData, jobDescription, matchedKeywords);
      setCoverLetter(result);
      incrementUse();
      setUsesRemaining(getUsesRemaining());
    } catch {
      setError('Failed to generate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  };

  const handleDownload = () => {
    const safeName = (profileData?.fullName || 'Cover_Letter')
      .trim()
      .replace(/\s+/g, '_');
    const filename = `${safeName}_Cover_Letter.txt`;
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const canGenerate = usesRemaining > 0 || isPaid;
  const totalGenerated = MAX_FREE - usesRemaining;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cover Letter</h2>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${
              isPaid
                ? 'bg-purple-100 text-purple-700'
                : usesRemaining > 0
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-gray-100 text-gray-500'
            }`}>
              {isPaid
                ? 'Pro — Unlimited'
                : usesRemaining > 0
                  ? `${usesRemaining} of ${MAX_FREE} free uses remaining`
                  : 'No free uses remaining'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

          {/* ── Locked state (free tier, limit reached) ── */}
          {usesRemaining <= 0 && !isPaid && coverLetter === null && (
            <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                You've used your 3 free cover letters.
              </h3>
              <p className="text-sm text-gray-500 mb-4">Upgrade to Pro for unlimited cover letters.</p>
              <button
                onClick={() => createCheckoutSession()}
                className="mt-4 px-6 py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                ⚡ Upgrade to Pro — Unlimited Cover Letters
              </button>
            </div>
          )}

          {/* ── Initial: prompt to generate ── */}
          {canGenerate && coverLetter === null && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Ready to write your cover letter
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {isPaid
                  ? 'Unlimited generations with Pro'
                  : `Uses 1 of your ${usesRemaining} remaining free generation${usesRemaining !== 1 ? 's' : ''}`}
              </p>
              <button
                onClick={handleGenerate}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
              >
                ✉ Generate Cover Letter
              </button>
            </div>
          )}

          {/* ── Loading state ── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
              <svg
                className="animate-spin h-10 w-10 text-teal-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Writing your cover letter...</p>
            </div>
          )}

          {/* ── Error state ── */}
          {error && !isLoading && coverLetter === null && (
            <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 max-w-sm w-full">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Generated state ── */}
          {coverLetter !== null && !isLoading && (
            <div className="flex flex-col flex-1 px-5 py-4 min-h-0">
              <textarea
                className="flex-1 min-h-0 w-full p-4 text-sm text-gray-800 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                spellCheck
              />
              <p className="text-xs text-gray-400 mt-2 text-right">
                {isPaid
                  ? `${totalGenerated} cover letter${totalGenerated !== 1 ? 's' : ''} generated`
                  : usesRemaining > 0
                    ? `${usesRemaining} free generation${usesRemaining !== 1 ? 's' : ''} remaining`
                    : 'No free generations remaining'}
              </p>
            </div>
          )}

        </div>

        {/* ── Bottom action bar (generated state only) ── */}
        {coverLetter !== null && !isLoading && (
          <div className="px-5 py-3 border-t bg-gray-50 flex items-center gap-3">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                copied
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Download .txt
            </button>
            {canGenerate && (
              <button
                onClick={handleGenerate}
                className="ml-auto px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                Regenerate
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CoverLetterModal;
