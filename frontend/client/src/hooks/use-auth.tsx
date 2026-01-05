import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

console.log('🔧 API Base URL:', API_BASE_URL); // Debug log

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
        
        // Store token in localStorage (works across domains)
        localStorage.setItem("auth_token", data.token);
        console.log('✅ Token stored successfully');

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
      queryClient.setQueryData(["/api/user"], userData);
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

  const user = queryClient.getQueryData<Omit<SelectUser, 'password'>>(["/api/user"]);
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
      queryClient.setQueryData(["/api/user"], user);
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
      // Clear auth token from localStorage
      localStorage.removeItem("auth_token");
      console.log('✅ Token removed, user logged out');
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
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
        user: user ?? null,
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