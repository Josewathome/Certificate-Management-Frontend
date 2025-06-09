
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { secureStorage, StoredAuth } from '@/utils/secureStorage';
import { tokenManager } from '@/utils/tokenManager';
import { authAPI, User, LoginRequest, RegisterRequest } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = secureStorage.get();
      if (storedAuth) {
        // Validate the stored token
        const validation = tokenManager.validateToken();
        if (validation.isValid) {
          setUser(storedAuth.user);
        } else if (validation.needsRefresh) {
          // Try to refresh the token
          const refreshSuccess = await tokenManager.refreshAccessToken();
          if (refreshSuccess) {
            setUser(storedAuth.user);
          } else {
            // Refresh failed, clear storage
            performLogout(false); // Don't show toast on init
          }
        } else {
          // Invalid token, clear storage
          performLogout(false); // Don't show toast on init
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Set up periodic token validation (every 5 minutes)
    const interval = setInterval(async () => {
      if (user) {
        await checkAuthStatus();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const checkAuthStatus = async (): Promise<void> => {
    const validation = tokenManager.validateToken();
    
    if (!validation.isValid && !validation.needsRefresh) {
      // Token is invalid and can't be refreshed
      performLogout(true);
      return;
    }
    
    if (validation.needsRefresh) {
      const refreshSuccess = await tokenManager.refreshAccessToken();
      if (!refreshSuccess) {
        performLogout(true);
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Please login again to continue.",
        });
      }
    }
  };

  const login = async (data: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(data);
      
      const authData: StoredAuth = {
        access: response.access,
        refresh: response.refresh,
        user: response.user,
      };
      
      secureStorage.set(authData);
      setUser(response.user);
      
      toast({
        title: "Welcome back!",
        description: `Hello ${response.user.name}`,
      });
    } catch (error: any) {
      let message = "Login failed. Please try again.";
      
      if (error.status === 400 || error.status === 401) {
        message = "Invalid credentials. Please check your email/username and password.";
      }
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      await authAPI.register(data);
      
      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      let message = "Registration failed. Please try again.";
      
      if (error.status === 400) {
        message = "Please check your information and try again.";
      }
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: message,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const performLogout = (showToast: boolean = true): void => {
    tokenManager.performSecureLogout();
    setUser(null);
    
    if (showToast) {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const logout = (): void => {
    performLogout(true);
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    const currentAuth = secureStorage.get();
    if (currentAuth) {
      secureStorage.set({ ...currentAuth, user: updatedUser });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
