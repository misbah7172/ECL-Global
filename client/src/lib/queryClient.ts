import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { SESSION_KEYS, clearSession } from "@/lib/session";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle 401 errors globally
    if (res.status === 401) {
      // Clear auth data and redirect to login
      clearSession();
      window.location.href = "/login";
      return;
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem(SESSION_KEYS.TOKEN);
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
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
    const [url, params] = queryKey as [string, Record<string, any>?];
    
    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      if (searchParams.toString()) {
        finalUrl = `${url}?${searchParams.toString()}`;
      }
    }
    
    const res = await fetch(finalUrl, {
      headers: {
        ...(localStorage.getItem(SESSION_KEYS.TOKEN) && {
          Authorization: `Bearer ${localStorage.getItem(SESSION_KEYS.TOKEN)}`,
        }),
      },
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      // Clear auth data on 401
      clearSession();
      return null;
    }

    if (res.status === 401) {
      // Clear auth data and redirect to login
      clearSession();
      window.location.href = "/login";
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
