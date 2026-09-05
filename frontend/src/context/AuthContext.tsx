import { createContext, useContext, useState, type ReactNode } from 'react';
import { setAccessToken } from '../services/apiClient';

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextValue {
  user: User | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(user: User, accessToken: string) {
    setUser(user);
    setAccessToken(accessToken);
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return ctx;
}
