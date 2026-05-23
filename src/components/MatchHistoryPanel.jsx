import React, { useState } from 'react';
import { getMatchHistory, deleteMatchRecord } from '../utils/matchHistory';

const scoreColors = (score) => {
  if (score >= 70) return 'bg-green-100 border-green-300 text-green-800';
  if (score >= 50) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  return 'bg-red-100 border-red-300 text-red-800';
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const KeywordPills = ({ items, colorClass, max = 8 }) => {
  const visible = items.slice(0, max);
  const overflow = items.length - max;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {visible.map((kw, i) => (
        <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {kw}
        </span>
      ))}
      {overflow > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          +{overflow} more
        </span>
      )}
    </div>
  );
};

const MatchHistoryPanel = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState(() => getMatchHistory());
  const [expandedId, setExpandedId] = useState(null);

  const handleDelete = (id) => {
    const updated = deleteMatchRecord(id);
    setHistory(updated);
    if (expandedId === id) setExpandedId(null);
  };

  const handleClearAll = () => {
    history.forEach((r) => deleteMatchRecord(r.id));
    setHistory([]);
    setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Re-sync from storage whenever panel opens
  React.useEffect(() => {
    if (isOpen) setHistory(getMatchHistory());
  }, [isOpen]);

  return (
    <div className={isOpen ? 'fixed inset-0 z-50' : 'hidden'}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Match History</h2>
            <p className="text-xs text-gray-500 mt-0.5">{history.length} record{history.length !== 1 ? 's' : ''}</p>
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

        {/* Disclaimer */}
        <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          History is stored locally on this device only.
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">No matches yet</p>
              <p className="text-xs mt-1">Tailored resumes will appear here</p>
            </div>
          ) : (
            history.map((record) => {
              const isExpanded = expandedId === record.id;
              return (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3 p-3">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm font-bold ${scoreColors(record.matchScore)}`}
                    >
                      {record.matchScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{formatDate(record.date)}</p>
                      <p className="text-sm text-gray-700 mt-0.5 line-clamp-2 leading-snug">
                        {record.jobSnippet}
                        {record.jobSnippet.length >= 100 ? '…' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete record"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(record.id)}
                    className="w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-t border-gray-100 transition-colors font-medium"
                  >
                    {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-2 bg-gray-50 border-t border-gray-100 space-y-3">
                      {record.matchedKeywords && record.matchedKeywords.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Matched:</p>
                          <KeywordPills
                            items={record.matchedKeywords}
                            colorClass="bg-green-100 text-green-800"
                          />
                        </div>
                      )}
                      {record.missingKeywords && record.missingKeywords.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600">Missing:</p>
                          <KeywordPills
                            items={record.missingKeywords}
                            colorClass="bg-red-100 text-red-800"
                          />
                        </div>
                      )}
                      {record.suggestions && record.suggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Suggestions:</p>
                          <ol className="space-y-1">
                            {record.suggestions.slice(0, 3).map((s, i) => (
                              <li key={i} className="text-xs text-gray-700 leading-snug">
                                <span className="font-medium text-blue-700">{i + 1}.</span> {s}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer — Clear All */}
        {history.length > 0 && (
          <div className="px-4 py-3 border-t">
            <button
              onClick={handleClearAll}
              className="w-full py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistoryPanel;
