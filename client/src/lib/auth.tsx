import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { 
  isTokenExpired, 
  updateLastActivity, 
  clearSession, 
  isSessionInactive,
  SESSION_KEYS 
} from "@/lib/session";

interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const savedToken = localStorage.getItem(SESSION_KEYS.TOKEN);
      const savedUser = localStorage.getItem(SESSION_KEYS.USER);
      
      if (savedToken && savedUser) {
        // Check if token is expired
        if (isTokenExpired(savedToken)) {
          clearSession();
          setToken(null);
          setUser(null);
          return;
        }
        
        // Check if session is inactive
        if (isSessionInactive()) {
          clearSession();
          setToken(null);
          setUser(null);
          return;
        }
        
        // Verify token is still valid by making a request to a protected endpoint
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setToken(savedToken);
          setUser(data.user);
          updateLastActivity();
        } else if (response.status === 401 || response.status === 403) {
          // Token is invalid, try to refresh it
          const refreshResponse = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setToken(refreshData.token);
            setUser(refreshData.user);
            localStorage.setItem(SESSION_KEYS.TOKEN, refreshData.token);
            localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(refreshData.user));
            updateLastActivity();
          } else {
            // Both verification and refresh failed, clear auth data
            clearSession();
            setToken(null);
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid auth data
      clearSession();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Set up token refresh interval (every 23 hours)
    const refreshInterval = setInterval(async () => {
      const savedToken = localStorage.getItem(SESSION_KEYS.TOKEN);
      if (savedToken && !isTokenExpired(savedToken)) {
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem(SESSION_KEYS.TOKEN, data.token);
            localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(data.user));
            updateLastActivity();
          } else {
            // Refresh failed, logout
            logout();
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          logout();
        }
      }
    }, 23 * 60 * 60 * 1000); // 23 hours
    
    // Set up activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const updateActivity = () => updateLastActivity();
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    return () => {
      clearInterval(refreshInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(SESSION_KEYS.TOKEN, data.token);
    localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(data.user));
    updateLastActivity();
  };

  const register = async (userData: any) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(SESSION_KEYS.TOKEN, data.token);
    localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(data.user));
    updateLastActivity();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token,
      isAdmin: user?.role === "admin" || user?.role === "instructor",
      isLoading,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
