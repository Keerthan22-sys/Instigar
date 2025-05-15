import { QueryClient, QueryFunction } from "@tanstack/react-query";
import Cookies from "js-cookie";

// Base URL for Spring Boot API
const API_BASE_URL = "http://localhost:8080";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
// Ensure URL has correct base for Spring Boot API
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  // Get auth token from cookies
  const token = Cookies.get("auth_token");
  
  // Prepare headers
  const headers: HeadersInit = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json";
  } else {
    headers["Accept"] = "application/json";
  }
  
  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
// Ensure URL has correct base for Spring Boot
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    
    // Get auth token from cookies
    const token = Cookies.get("auth_token");
    
    // Prepare headers
    const headers: HeadersInit = {
      "Accept": "application/json"
    };
    
    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
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
