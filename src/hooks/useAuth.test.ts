import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "./useAuth";

describe("useAuth hook", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("should initialize with isAuthenticated false if no apiKey", () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AuthProvider, null, children),
      );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should initialize with isAuthenticated true if apiKey exists", () => {
    sessionStorage.setItem("apiKey", "test-key");
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AuthProvider, null, children),
      );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should set isAuthenticated to true on login", () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AuthProvider, null, children),
      );

    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login("test-key");
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(sessionStorage.getItem("apiKey")).toBe("test-key");
  });

  it("should set isAuthenticated to false on logout", () => {
    sessionStorage.setItem("apiKey", "test-key");
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AuthProvider, null, children),
      );

    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem("apiKey")).toBeNull();
  });
});
