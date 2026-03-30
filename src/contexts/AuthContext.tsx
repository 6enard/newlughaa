import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

const STORAGE_KEY = 'lugha47_auth_user';

interface StoredUser {
  email: string;
  passwordHash: string;
}

interface StoredUsers {
  [email: string]: StoredUser;
}

const hashPassword = (password: string): string => {
  return btoa(password);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string) => {
    const usersData = localStorage.getItem('lugha47_users');
    const users: StoredUsers = usersData ? JSON.parse(usersData) : {};

    if (users[email]) {
      throw new Error('Email already in use');
    }

    const newUser: StoredUser = {
      email,
      passwordHash: hashPassword(password),
    };

    users[email] = newUser;
    localStorage.setItem('lugha47_users', JSON.stringify(users));

    const authenticatedUser: User = {
      uid: btoa(email),
      email,
    };

    setUser(authenticatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
  };

  const login = async (email: string, password: string) => {
    const usersData = localStorage.getItem('lugha47_users');
    const users: StoredUsers = usersData ? JSON.parse(usersData) : {};

    const storedUser = users[email];
    if (!storedUser || storedUser.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid credentials');
    }

    const authenticatedUser: User = {
      uid: btoa(email),
      email,
    };

    setUser(authenticatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
