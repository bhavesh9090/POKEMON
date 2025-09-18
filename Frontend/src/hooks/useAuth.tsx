import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
  rollNo?: string;
  department?: string;
  year?: string;
  studentId?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ user: User } | { error: string }>;
  register: (
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'student',
    rollNo?: string,
    department?: string,
    year?: string
  ) => Promise<{ user: User } | { error: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Backend API URL
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('attendo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.message || "Login failed" };
      }

      setUser(data.user);
      localStorage.setItem('attendo_user', JSON.stringify(data.user));

      return { user: data.user };
    } catch {
      return { error: 'Server not reachable' };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'student',
    rollNo?: string,
    department?: string,
    year?: string
  ) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role, rollNo, department, year }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.message || "Registration failed" };
      }

      setUser(data.user);
      localStorage.setItem('attendo_user', JSON.stringify(data.user));

      return { user: data.user };
    } catch {
      return { error: 'Server not reachable' };
    }
  };  

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendo_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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
