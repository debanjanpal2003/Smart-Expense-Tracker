'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/core/database/db';
import { UserProfile } from '@/models/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshProfile = async () => {
    const profiles = await db.profile.toArray();
    const currentProfile = profiles[0] || null;
    setProfile(currentProfile);
    setLoading(false);

    if (!currentProfile && pathname !== '/onboarding' && !pathname.startsWith('/auth')) {
      router.push('/onboarding');
    } else if (currentProfile && !currentProfile.onboardingComplete && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  };

  const logout = async () => {
    await db.profile.clear();
    setProfile(null);
    router.push('/onboarding');
  };

  useEffect(() => {
    refreshProfile();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ profile, loading, refreshProfile, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
