/**
 * Generates a tailored cover letter via the Netlify serverless proxy.
 * @param {Object} profileData - The user's profile object
 * @param {string} jobDescription - The target job description
 * @param {string[]} matchedKeywords - Keywords matched from the job analysis
 * @returns {Promise<string>} The generated cover letter as plain text
 */
export async function generateCoverLetter(profileData, jobDescription, matchedKeywords) {
  const response = await fetch('/api/cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileData, jobDescription, matchedKeywords }),
  });

  if (!response.ok) {
    throw new Error(`Cover letter generation failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.coverLetter;
}
