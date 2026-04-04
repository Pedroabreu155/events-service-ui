const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 1;

export interface FetchOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const apiKey = sessionStorage.getItem("apiKey");

    const headers = new Headers(options.headers);
    if (apiKey) {
      headers.set("x-api-key", apiKey);
    }
    headers.set("Content-Type", "application/json");

    const url = new URL(`${BASE_URL}${endpoint}`);
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    let retries = 0;
    while (retries <= MAX_RETRIES) {
      try {
        const response = await fetchWithTimeout(url.toString(), {
          ...options,
          headers,
        });

        if (response.status === 401) {
          sessionStorage.removeItem("apiKey");
          // In a real app, you might want to trigger a redirect here via an event or store
          window.dispatchEvent(new CustomEvent("unauthorized"));
          throw new ApiError(401, "Unauthorized");
        }

        if (!response.ok) {
          // Check if response has content before trying to parse as JSON
          const contentType = response.headers.get("content-type");
          let errorData = {};
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json().catch(() => ({}));
          }
          throw new ApiError(
            response.status,
            `HTTP Error ${response.status}`,
            errorData,
          );
        }

        return await response.json();
      } catch (error: any) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }

        const isNetworkError =
          error.name === "TypeError" || error.message.includes("network");
        if (isNetworkError && retries < MAX_RETRIES) {
          console.warn(
            `Tentativa ${retries + 1} falhou (Erro de Rede). Tentando novamente...`,
          );
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
          continue;
        }

        console.error("Erro na requisição API:", error);
        throw error;
      }
    }
    throw new Error("Maximum retries exceeded");
  },

  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
