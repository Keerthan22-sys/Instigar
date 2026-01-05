import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base URL for Spring Boot API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

console.log('🔧 API Base URL in queryClient:', API_BASE_URL); // Debug log

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`); // Fixed template literal
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL has correct base for Spring Boot API
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  // Get auth token from localStorage (NOT cookies - cross-domain issue)
  const token = localStorage.getItem("auth_token");
  
  console.log('🚀 API Request:', method, fullUrl);
  console.log('🔑 Token present:', !!token);
  
  // Prepare headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  
  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      // Remove credentials: "include" - not needed with Bearer token
      // Remove Origin header - browser sets this automatically
    });
    
    console.log('📡 Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`); // Fixed template literal
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
    
    // Get token from localStorage
    const token = localStorage.getItem("auth_token");
    
    console.log('🔍 Query:', fullUrl);
    
    const headers: HeadersInit = {
      "Accept": "application/json"
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(fullUrl, {
      headers
      // Remove credentials: "include"
    });
    
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
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