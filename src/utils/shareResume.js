import LZString from 'lz-string';

export function encodeResume(finalResume) {
  const clone = { ...finalResume };
  delete clone.profilePicture;
  const jsonString = JSON.stringify(clone);
  return LZString.compressToEncodedURIComponent(jsonString);
}

export function decodeResume(encoded) {
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(encoded);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export function buildShareUrl(finalResume) {
  const encoded = encodeResume(finalResume);
  return window.location.origin + '/?r=' + encoded;
}
