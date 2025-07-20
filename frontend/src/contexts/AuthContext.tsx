import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, User, LoginCredentials, RegisterData } from '../api/authApi';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session timeout handling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Set timeout for 30 minutes of inactivity
      timeoutId = setTimeout(() => {
        logout();
        toast.error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      }, 30 * 60 * 1000);
    };

    const handleActivity = () => {
      if (user) {
        resetTimeout();
      }
    };

    if (user) {
      resetTimeout();
      // Listen for user activity
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('touchstart', handleActivity);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [user]);

  // Check for existing session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } catch {
        // Token might be expired, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      setUser(response.user);
      toast.success(`ยินดีต้อนรับ ${response.user.firstName}`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'เข้าสู่ระบบไม่สำเร็จ';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      await authApi.register(data);
      toast.success('สร้างบัญชีผู้ใช้สำเร็จ');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'สร้างบัญชีไม่สำเร็จ';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    toast.success('ออกจากระบบสำเร็จ');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
      toast.success('อัปเดตข้อมูลส่วนตัวสำเร็จ');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'อัปเดตข้อมูลไม่สำเร็จ';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      setIsLoading(true);
      await authApi.changePassword(data);
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};