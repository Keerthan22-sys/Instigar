import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Get API base URL from environment variable (Vite uses import.meta.env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-app-backend-production.up.railway.app'  // ⚠️ REPLACE WITH YOUR ACTUAL RAILWAY URL
    : 'http://localhost:8080');

console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🔧 API Base URL:', API_BASE_URL);

type AuthContextType = {
  user: Omit<SelectUser, 'password'> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<SelectUser, 'password'>, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<SelectUser, 'password'>, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
type AuthResponse = {
  token: string;
  username?: string;
  message?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Use useState to make user state reactive
  // Note: "/api/user" is used as a cache key only, not an actual API endpoint
  const [user, setUser] = useState<Omit<SelectUser, 'password'> | null>(() => {
    // Initialize from queryClient cache if available (cache key, not API endpoint)
    const cachedUser = queryClient.getQueryData<Omit<SelectUser, 'password'>>(["/api/user"]);
    
    // Also check if token exists in localStorage - if it does, we should have a user
    const token = localStorage.getItem("auth_token");
    if (token && !cachedUser) {
      console.log('🔑 Token found in localStorage but no cached user - restoring user from token');
      // If token exists but no cached user, create user object from token context
      // We'll set it after login, so this is just for initialization
    }
    
    return cachedUser ?? null;
  });
  
  // Sync with queryClient cache changes - only for the user cache key
  // Note: "/api/user" is a cache key, not an actual API endpoint
  useEffect(() => {
    // Check token on mount and verify consistency
    const token = localStorage.getItem("auth_token");
    const cachedUser = queryClient.getQueryData<Omit<SelectUser, 'password'>>(["/api/user"]);
    
    if (token && !cachedUser) {
      console.warn('⚠️ Token exists but no cached user - attempting to restore user state');
      // If token exists, we should have a user - try to restore from token
      // Since we don't have a /api/user endpoint, we'll create a minimal user object
      // The actual user data will come from successful login/register operations
      // For now, we'll just log this - the user will need to log in again if state is lost
      console.warn('⚠️ User state lost but token exists - user may need to refresh or re-authenticate');
    }
    if (!token && cachedUser) {
      console.warn('⚠️ User is cached but no token found - clearing user state');
      queryClient.setQueryData(["/api/user"], null);
      setUser(null);
    }
    
    // Subscribe only to changes in the user cache key
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // Only update if the user cache key changed
      if (event?.query?.queryKey?.[0] === "/api/user") {
        const cachedUser = queryClient.getQueryData<Omit<SelectUser, 'password'>>(["/api/user"]);
        const currentToken = localStorage.getItem("auth_token");
        
        // Verify token consistency
        if (cachedUser && !currentToken) {
          console.warn('⚠️ User state exists but token is missing - clearing user state');
          queryClient.setQueryData(["/api/user"], null);
          setUser(null);
          return;
        }
        
        setUser((prevUser) => {
          // Only update if the value actually changed to avoid unnecessary re-renders
          if (cachedUser !== prevUser) {
            return cachedUser ?? null;
          }
          return prevUser;
        });
      }
    });
    return unsubscribe;
  }, []);
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log('🚀 Attempting login to:', `${API_BASE_URL}/api/auth/login`);
        
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials)
        });

        console.log('📡 Response status:', res.status);

        const rawResponse = await res.text();
        console.log('📦 Raw response:', rawResponse);
        
        if (!res.ok) {
          throw new Error(rawResponse || 'Login request failed');
        }

        const data = JSON.parse(rawResponse) as AuthResponse;
        
        if (!data.token) {
          throw new Error('No token received from server');
        }
        
        // Store token with comprehensive error handling
        try {
          localStorage.setItem("auth_token", data.token);
          console.log('✅ Token stored in localStorage');
          
          // Verify token was stored immediately
          const storedToken = localStorage.getItem("auth_token");
          if (!storedToken) {
            console.error('❌ CRITICAL: Token storage verification failed - token is null!');
            throw new Error('Failed to store authentication token - localStorage returned null');
          }
          if (storedToken !== data.token) {
            console.error('❌ CRITICAL: Token storage verification failed - token mismatch!');
            console.error('  Expected:', data.token.substring(0, 20) + '...');
            console.error('  Got:', storedToken.substring(0, 20) + '...');
            throw new Error('Failed to store authentication token - token mismatch');
          }
          console.log('✅ Token storage verified:', storedToken.substring(0, 20) + '...');
          console.log('✅ Token length:', storedToken.length);
          
          // Also store in sessionStorage as backup
          try {
            sessionStorage.setItem("auth_token", data.token);
            console.log('✅ Token also stored in sessionStorage as backup');
          } catch (e) {
            console.warn('⚠️ Could not store token in sessionStorage:', e);
          }
        } catch (storageError) {
          console.error('❌ CRITICAL: Failed to store token in localStorage:', storageError);
          // Try sessionStorage as fallback
          try {
            sessionStorage.setItem("auth_token", data.token);
            console.log('✅ Token stored in sessionStorage as fallback');
          } catch (e) {
            console.error('❌ CRITICAL: Cannot store token in sessionStorage either:', e);
            throw new Error('Cannot store authentication token. localStorage and sessionStorage are both unavailable.');
          }
        }

        return {
          id: 1,
          username: credentials.username
        };
      } catch (error) {
        console.error('❌ Login error:', error);
        throw error;
      }
    },
    onSuccess: (userData) => {
      console.log('✅ Login successful:', userData);
      console.log('🔄 Updating user state and query cache (cache key: /api/user)');
      // Store user data in cache using "/api/user" as cache key (not an API endpoint)
      queryClient.setQueryData(["/api/user"], userData);
      setUser(userData); // Update state immediately
      console.log('✅ User state updated, component should re-render');
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      console.error('❌ Login failed:', error);
      localStorage.removeItem("auth_token");
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = false;
  const error = null;

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log('🚀 Attempting registration to:', `${API_BASE_URL}/api/auth/register`);
      
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed');
      }

      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      const userData = { id: user.id, username: user.username };
      queryClient.setQueryData(["/api/user"], userData);
      setUser(userData); // Update state immediately
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("auth_token");
      console.log('✅ Token removed, user logged out');
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      setUser(null); // Update state immediately
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}