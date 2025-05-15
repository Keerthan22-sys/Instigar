import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

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
  message?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await fetch('http://localhost:8080/api/auth/login', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify(credentials)
        });

        const rawResponse = await res.text();
        
        if (!res.ok) {
          throw new Error(rawResponse || 'Login request failed');
        }

        try {
          const data = JSON.parse(rawResponse) as AuthResponse;
          if (!data.token) {
            throw new Error('No token received from server');
          }
          
          Cookies.set("auth_token", data.token, { 
            expires: 7,
            path: '/'
          });

          return {
            id: 1,
            username: credentials.username
          };
        } catch (e) {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    onSuccess: (userData) => {
      console.log('Login mutation succeeded:', userData);
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      console.error('Login mutation failed:', error);
      Cookies.remove("auth_token", { path: '/' });
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove the initial user query since we don't need it anymore
  const user = queryClient.getQueryData<Omit<SelectUser, 'password'>>(["/api/user"]);
  const isLoading = false;
  const error = null;

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
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
      // Clear auth token from cookies
      Cookies.remove("auth_token");
      await apiRequest("POST", "/api/logout");
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