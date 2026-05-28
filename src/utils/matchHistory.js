const STORAGE_KEY = 'resume_match_history';
const MAX_RECORDS = 20;

export const getMatchHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveMatchRecord = (jobDescription, tailoredData, resumeData) => {
  const { profilePicture, ...safeResume } = resumeData || {};
  const record = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    jobSnippet: jobDescription.trim().substring(0, 100),
    matchScore: tailoredData.matchScore,
    matchedKeywords: tailoredData.matchedKeywords,
    missingKeywords: tailoredData.missingKeywords,
    suggestions: tailoredData.suggestions || [],
    resumeData: resumeData ? safeResume : null,
  };
  const existing = getMatchHistory();
  const updated = [record, ...existing].slice(0, MAX_RECORDS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full or unavailable — silently skip
  }
  return updated;
};

export const deleteMatchRecord = (id) => {
  const updated = getMatchHistory().filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
};
