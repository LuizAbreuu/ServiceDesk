import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const getStoredToken = () => localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

function persistSession(tokens: { accessToken: string; refreshToken: string }, rememberMe: boolean) {
  const storage = rememberMe ? localStorage : sessionStorage;
  const alternateStorage = rememberMe ? sessionStorage : localStorage;

  alternateStorage.removeItem('accessToken');
  alternateStorage.removeItem('refreshToken');
  storage.setItem('accessToken', tokens.accessToken);
  storage.setItem('refreshToken', tokens.refreshToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      authService.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Idle timeout: Logout after 10 minutes of inactivity
  useEffect(() => {
    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      if (user) {
        timeoutId = window.setTimeout(() => {
          logout();
        }, 10 * 60 * 1000); // 10 minutes
      }
    };

    if (user) {
      resetTimer();
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('click', resetTimer);
      window.addEventListener('scroll', resetTimer);
    }

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [user]);

  async function login(email: string, password: string, rememberMe = true) {
    const { tokens, user } = await authService.login({ email, password });
    persistSession(tokens, rememberMe);
    setUser(user);
  }

  async function register(name: string, email: string, password: string, rememberMe = true) {
    const { tokens, user } = await authService.register({ name, email, password });
    persistSession(tokens, rememberMe);
    setUser(user);
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
