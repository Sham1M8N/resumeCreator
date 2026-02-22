import { useState, useEffect } from 'react';

const STORAGE_KEY = 'resume_profile_data';

const useProfile = () => {
  // Initialize state from localStorage or use default empty profile
  const [profile, setProfileState] = useState(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
    } catch (error) {
      console.error('Error loading profile from localStorage:', error);
    }
    return null;
  });

  // Save to localStorage whenever profile changes
  useEffect(() => {
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        console.log('Profile saved to localStorage:', profile);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
    }
  }, [profile]);

  // Set profile function
  const setProfile = (newProfile) => {
    setProfileState(newProfile);
  };

  // Clear profile function
  const clearProfile = () => {
    setProfileState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing profile from localStorage:', error);
    }
  };

  return {
    profile,
    setProfile,
    clearProfile
  };
};

export default useProfile;
