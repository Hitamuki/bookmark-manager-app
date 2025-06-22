"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, profiles } from '@/lib/data';

interface ProfileContextType {
  currentProfile: Profile;
  switchProfile: (profileId: 'private' | 'business' | 'learning') => void;
  profiles: Profile[];
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<Profile>(profiles[0]);

  useEffect(() => {
    const stored = localStorage.getItem('currentProfile');
    if (stored) {
      const profile = profiles.find(p => p.id === stored);
      if (profile) {
        setCurrentProfile(profile);
      }
    }
  }, []);

  const switchProfile = (profileId: 'private' | 'business' | 'learning') => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      localStorage.setItem('currentProfile', profileId);
    }
  };

  return (
    <ProfileContext.Provider value={{ currentProfile, switchProfile, profiles }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}