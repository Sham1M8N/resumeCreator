import React, { useRef, useState } from 'react';

const MAX_DIMENSION = 200;
const MAX_BYTES = 200 * 1024;

const ProfilePictureUpload = ({ value, onChange }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset so the same file can be re-selected after removal
    e.target.value = '';

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(objectUrl);

      // base64 string length → approximate byte size
      const bytes = Math.round((base64.length * 3) / 4);
      if (bytes > MAX_BYTES) {
        setError('Image too large after compression. Try a smaller image.');
        return;
      }

      setError(null);
      onChange(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('Could not read image. Please try another file.');
    };

    img.src = objectUrl;
  };

  const handleRemove = () => {
    setError(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        <>
          <img
            src={value}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Change
            </button>
            <span className="text-xs text-gray-300">|</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Remove
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs text-gray-500 mt-1">Upload Photo</span>
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 max-w-[160px] text-center">{error}</p>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
