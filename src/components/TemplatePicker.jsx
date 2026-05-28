import React, { useEffect } from 'react';

const templates = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Traditional blue accents, clean layout',
    thumbnail: (
      <div className="w-full h-full p-2 bg-white">
        <div className="border-b-4 border-blue-600 pb-1 mb-1">
          <div className="h-2 bg-gray-800 rounded w-3/4 mb-1" />
          <div className="h-1 bg-gray-400 rounded w-1/2" />
        </div>
        <div className="h-1.5 bg-blue-600 rounded w-1/3 mb-1" />
        <div className="space-y-0.5">
          <div className="h-1 bg-gray-300 rounded w-full" />
          <div className="h-1 bg-gray-300 rounded w-5/6" />
        </div>
      </div>
    ),
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Bold blue header with tinted background',
    thumbnail: (
      <div className="w-full h-full p-2 bg-white">
        <div className="border-b-4 border-blue-700 bg-blue-50 rounded-t pb-1 mb-1">
          <div className="h-2 bg-blue-900 rounded w-3/4 mb-1" />
          <div className="h-1 bg-blue-400 rounded w-1/2" />
        </div>
        <div className="h-1.5 bg-blue-700 rounded w-1/3 mb-1" />
        <div className="flex gap-1 flex-wrap mb-1">
          <div className="h-1.5 bg-blue-700 rounded w-8" />
          <div className="h-1.5 bg-blue-700 rounded w-10" />
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean lines, subtle gray tones',
    thumbnail: (
      <div className="w-full h-full p-2 bg-white">
        <div className="border-b border-gray-300 pb-1 mb-1">
          <div className="h-2 bg-gray-800 rounded w-3/4 mb-1" />
          <div className="h-1 bg-gray-400 rounded w-1/2" />
        </div>
        <div className="h-1 bg-gray-400 rounded w-1/3 mb-1" />
        <div className="space-y-0.5">
          <div className="h-1 bg-gray-200 rounded w-full" />
          <div className="h-1 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
    ),
  },
];

const TemplatePicker = ({ selected, onChange, isPaid }) => {
  useEffect(() => {
    if (!isPaid && selected !== 'classic') onChange('classic');
  }, [isPaid, selected, onChange]);

  return (
    <div className="max-w-4xl mx-auto mb-6 print:hidden">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
        Resume Template
      </h3>
      <div className="flex gap-4">
        {templates.map((t) => {
          const locked = !isPaid && t.id !== 'classic';
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (!isPaid && t.id !== 'classic') return;
                onChange(t.id);
              }}
              className={`relative flex-1 rounded-lg overflow-hidden border-2 transition-all ${
                selected === t.id
                  ? 'border-blue-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="h-24 bg-gray-50">{t.thumbnail}</div>
              <div className="p-2 text-left">
                <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                <p className="text-xs text-gray-500">{t.description}</p>
              </div>
              {locked && (
                <div className="absolute inset-0 bg-white/75 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    ⚡ Pro
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatePicker;
