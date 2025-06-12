import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { secureStorage, StoredAuth } from '@/utils/secureStorage';
import { tokenManager } from '@/utils/tokenManager';
import { authAPI, User, LoginRequest, RegisterRequest } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { triggerLogout } from '@/utils/logout';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest | FormData) => Promise<void>;
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
  const navigate = useNavigate();

  const location = useLocation();
  const publicRoutes = ['/login', '/register', '/password-reset']; // Add other public routes as needed

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = secureStorage.get();
      let hasValidSession = false;

      if (storedAuth) {
        const validation = tokenManager.validateToken();
        if (validation.isValid) {
          setUser(storedAuth.user);
          hasValidSession = true;
        } else if (validation.needsRefresh) {
          const refreshSuccess = await tokenManager.refreshAccessToken();
          if (refreshSuccess) {
            setUser(storedAuth.user);
            hasValidSession = true;
          } else {
            performLogout(false);
          }
        } else {
          performLogout(false);
        }
      }

      // Only redirect to login if no valid session AND not on public route
      if (!hasValidSession && !publicRoutes.includes(location.pathname)) {
        navigate('/login', { replace: true });
      }

      setIsLoading(false);
    };

    initAuth();
  }, [navigate, location.pathname]);

  // Periodic token validation, only when user is logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      await checkAuthStatus();
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

  const register = async (data: RegisterRequest | FormData): Promise<void> => {
    try {
      setIsLoading(true);
      if (data instanceof FormData) {
        await authAPI.registerWithFormData(data);
      } else {
        await authAPI.register(data);
      }
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
    console.log('performLogout called');
    tokenManager.performSecureLogout();
    setUser(null);
    triggerLogout();
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
