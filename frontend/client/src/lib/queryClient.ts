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
  
  // Check localStorage availability and token
  let token: string | null = null;
  try {
    // Test localStorage access first
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Now get the token
    token = localStorage.getItem("auth_token");
    
    // Debug: Log all localStorage contents if token is missing
    if (!token) {
      console.error('❌ CRITICAL: Token not found in localStorage!');
      console.error('❌ Checking all localStorage keys...');
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allKeys.push(key);
          console.error(`  - Key: ${key}, Value: ${localStorage.getItem(key)?.substring(0, 50)}...`);
        }
      }
      console.error('❌ All localStorage keys:', allKeys);
      console.error('❌ localStorage.length:', localStorage.length);
      
      // Check if token might be in sessionStorage
      try {
        const sessionToken = sessionStorage.getItem("auth_token");
        if (sessionToken) {
          console.warn('⚠️ Token found in sessionStorage instead! Moving to localStorage...');
          localStorage.setItem("auth_token", sessionToken);
          token = sessionToken;
        }
      } catch (e) {
        console.error('❌ Cannot access sessionStorage:', e);
      }
    }
  } catch (error) {
    console.error('❌ localStorage access error:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
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
      
      // If 403, check if it's a token issue or permission issue
      if (res.status === 403) {
        console.error('❌ 403 Forbidden Error Details:');
        console.error('  - URL:', fullUrl);
        console.error('  - Method:', method);
        console.error('  - Has Token:', !!token);
        console.error('  - Error Body:', errorText || '(empty)');
        console.error('  - Response Headers:', Object.fromEntries(res.headers.entries()));
        
        // Decode JWT token to check roles (if token exists)
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.error('  - Token Payload:', payload);
              console.error('  - Token Subject (username):', payload.sub);
              console.error('  - Token Roles/Authorities:', payload.roles || payload.authorities || 'NOT FOUND');
              console.error('  - Token Expiry:', payload.exp ? new Date(payload.exp * 1000).toISOString() : 'NOT FOUND');
              
              if (!payload.roles && !payload.authorities) {
                console.error('⚠️ CRITICAL: JWT token does not contain roles/authorities!');
                console.error('⚠️ Backend requires roles: ADMIN, MANAGER, or USER');
                console.error('⚠️ Check backend JWT token generation - roles must be included in token');
              }
            }
          } catch (e) {
            console.error('  - Could not decode token:', e);
          }
        }
        
        // Check if it's likely a CORS issue (empty body + 403)
        if (!errorText && token) {
          console.error('⚠️ 403 with empty body - this might be a CORS or backend configuration issue');
          console.error('⚠️ Backend might be rejecting the request before processing the token');
          console.error('⚠️ Check backend CORS configuration and ensure it allows:');
          console.error('    - Origin: ' + (typeof window !== 'undefined' ? window.location.origin : 'unknown'));
          console.error('    - Headers: Authorization, Content-Type');
          console.error('    - Methods: GET, POST, PUT, DELETE');
          // Don't clear token - this is likely a backend config issue
        }
        
        // Don't automatically clear token on 403 - it might be a permission issue, not auth issue
        // Only clear if the error message specifically indicates token issues
        const isTokenError = errorText && (
          errorText.toLowerCase().includes('token') ||
          errorText.toLowerCase().includes('unauthorized') ||
          errorText.toLowerCase().includes('authentication') ||
          errorText.toLowerCase().includes('expired') ||
          errorText.toLowerCase().includes('invalid') ||
          errorText.toLowerCase().includes('jwt')
        );
        
        if (token && isTokenError) {
          console.warn('⚠️ 403 Forbidden - token appears invalid based on error message');
          console.warn('⚠️ Error message:', errorText);
          try {
            localStorage.removeItem("auth_token");
            sessionStorage.removeItem("auth_token");
            console.log('✅ Token cleared from localStorage and sessionStorage');
          } catch (error) {
            console.error('❌ Failed to clear token from storage:', error);
          }
        } else if (token && !isTokenError) {
          console.warn('⚠️ 403 Forbidden - but error does not indicate token issue');
          console.warn('⚠️ This might be a permission issue or backend configuration problem');
          console.warn('⚠️ Error message:', errorText || 'No error message (empty body)');
          console.warn('⚠️ NOT clearing token - user may need different permissions or backend needs configuration');
          // Don't clear token - might be a permission issue or backend config
        } else {
          console.error('❌ 403 Forbidden but no token was sent! This indicates a critical authentication issue.');
          console.error('❌ User may need to log in again. Check if localStorage is working properly.');
        }
        
        const errorMessage = errorText || (token 
          ? 'Access forbidden. This might be a permission issue or backend configuration problem. Check backend CORS settings and user permissions.'
          : 'No authentication token found. Please log in.');
        throw new Error(`Access forbidden (403). ${errorMessage}`);
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