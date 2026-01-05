import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get API base URL from environment variable (Vite uses import.meta.env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-app-backend-production.up.railway.app'  // ⚠️ REPLACE WITH YOUR ACTUAL RAILWAY URL
    : 'http://localhost:8080');

console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🔧 API Base URL in queryClient:', API_BASE_URL);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle 403 Forbidden - likely authentication issue
    if (res.status === 403) {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error(`Access forbidden (403). No authentication token found. Please log in.`);
      } else {
        throw new Error(`Access forbidden (403). ${text || 'Your authentication token may be invalid or expired. Please try logging in again.'}`);
      }
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  // Check localStorage availability
  let token: string | null = null;
  try {
    token = localStorage.getItem("auth_token");
  } catch (error) {
    console.error('❌ localStorage access error:', error);
    throw new Error('Cannot access localStorage. Please check browser settings.');
  }
  
  // Clean token if it exists (remove any whitespace)
  if (token) {
    token = token.trim();
    // Re-store the cleaned token
    try {
      localStorage.setItem("auth_token", token);
    } catch (error) {
      console.error('❌ Failed to update token in localStorage:', error);
    }
  }
  
  console.log('🚀 API Request:', method, fullUrl);
  console.log('🔑 Token present:', !!token);
  if (token) {
    console.log('🔑 Token length:', token.length);
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
  } else {
    // Check all localStorage keys to debug
    try {
      const allKeys = Object.keys(localStorage);
      console.warn('⚠️ Available localStorage keys:', allKeys);
      console.warn('⚠️ Searching for token in other keys...');
      for (const key of allKeys) {
        if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
          console.warn(`⚠️ Found potential token key: ${key}`);
        }
      }
    } catch (error) {
      console.error('❌ Cannot enumerate localStorage keys:', error);
    }
  }
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log('✅ Authorization header set');
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('📡 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error Response:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
        url: fullUrl,
        hasToken: !!token
      });
      
      // If 403, clear invalid token and provide helpful error
      if (res.status === 403) {
        if (token) {
          console.warn('⚠️ 403 Forbidden - clearing potentially invalid token');
          try {
            localStorage.removeItem("auth_token");
            console.log('✅ Token cleared from localStorage');
          } catch (error) {
            console.error('❌ Failed to clear token from localStorage:', error);
          }
          // Note: Auth state will be updated via the queryClient subscription in use-auth.tsx
        } else {
          console.error('❌ 403 Forbidden but no token was sent! This indicates a critical authentication issue.');
          console.error('❌ User may need to log in again. Check if localStorage is working properly.');
        }
        throw new Error(`Access forbidden (403). ${errorText || (token ? 'Your authentication token may be invalid or expired. Please try logging in again.' : 'No authentication token found. Please log in.')}`);
      }
      
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
    }
    
    return res;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    let token = localStorage.getItem("auth_token");
    
    // Clean token if it exists
    if (token) {
      token = token.trim();
    }
    
    console.log('🔍 Query:', fullUrl);
    console.log('🔑 Token present:', !!token);
    
    const headers: HeadersInit = {
      "Accept": "application/json"
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log('✅ Authorization header set for query');
    } else {
      console.warn('⚠️ No token found in localStorage for query');
    }
    
    const res = await fetch(fullUrl, {
      headers
    });
    
    console.log('📡 Query response status:', res.status);
    
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Query Error Response:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
        url: fullUrl,
        hasToken: !!token
      });
      
      // If 403, clear invalid token
      if (res.status === 403 && token) {
        console.warn('⚠️ 403 Forbidden - clearing potentially invalid token');
        localStorage.removeItem("auth_token");
      }
    }
    
    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});