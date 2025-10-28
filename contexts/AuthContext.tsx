'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getStytchClient } from '@/lib/stytch';

interface StytchUser {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: StytchUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StytchUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Stytch session
    const checkSession = async () => {
      try {
        const stytch = getStytchClient();

        if (!stytch) {
          // Stytch not configured, no user logged in
          setUser(null);
          setLoading(false);
          return;
        }

        // Check if user has an active session
        // For now, we'll set user to null until Stytch is fully configured
        setUser(null);
      } catch (error) {
        console.error('Error checking Stytch session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signOut = async () => {
    try {
      const stytch = getStytchClient();
      if (stytch) {
        // Attempt to revoke session
        // This will be implemented once Stytch is fully configured
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setUser(null); // Still clear the user even if revoke fails
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
