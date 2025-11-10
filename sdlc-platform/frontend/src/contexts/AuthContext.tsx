import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUser = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'admin'
};

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // In a real app, we would validate the token with the server
          // For this demo, we'll just simulate a successful auth check
          setUser(mockUser);
        }
      } catch (err) {
        setError('Authentication failed');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, we would make an API call to login
      // For this demo, we'll just simulate a successful login
      if (email === 'admin@example.com' && password === 'password') {
        const mockToken = 'mock-jwt-token';
        localStorage.setItem('authToken', mockToken);
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, we would make an API call to register
      // For this demo, we'll just simulate a successful registration
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('authToken', mockToken);
      
      const newUser = {
        id: '2',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user'
      };
      
      setUser(newUser);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
