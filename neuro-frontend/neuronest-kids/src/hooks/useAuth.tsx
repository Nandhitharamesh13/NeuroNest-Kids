import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { loginAPI, registerAPI, getMeAPI } from '@/api/backend';

// ── Types ──────────────────────────────────────────────────────────────────────
interface AppUser {
  id: string;
  email: string;
  displayName: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: { token: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'neuronest_auth_token';

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getMeAPI(token)
      .then((data) => {
        if (data && data.id) {
          setUser({
            id: String(data.id),
            email: data.email,
            displayName: data.displayName,
            createdAt: data.createdAt,
          });
          setSession({ token });
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ error: Error | null }> => {
    try {
      const data = await registerAPI(email, password, displayName);
      if (data.error) {
        return { error: new Error(data.error) };
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setSession({ token: data.token });
      setUser({
        id: String(data.user.id),
        email: data.user.email,
        displayName: data.user.displayName,
      });
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Registration failed') };
    }
  };

  // ── Sign In ────────────────────────────────────────────────────────────────
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    try {
      const data = await loginAPI(email, password);
      if (data.error) {
        return { error: new Error(data.error) };
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setSession({ token: data.token });
      setUser({
        id: String(data.user.id),
        email: data.user.email,
        displayName: data.user.displayName,
      });
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Login failed') };
    }
  };

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
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
