import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";

describe("API Fetch Wrapper", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
    sessionStorage.clear();
  });

  it("should inject x-api-key if present in sessionStorage", async () => {
    sessionStorage.setItem("apiKey", "test-key");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "success" }),
    });

    await api.get("/test");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.get("x-api-key")).toBe("test-key");
  });

  it("should handle 401 and clear sessionStorage", async () => {
    sessionStorage.setItem("apiKey", "test-key");
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    await expect(api.get("/test")).rejects.toThrow("Unauthorized");

    expect(sessionStorage.getItem("apiKey")).toBeNull();
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
    expect(dispatchSpy.mock.calls[0][0].type).toBe("unauthorized");
  });

  it("should retry on network error", async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: "success" }),
      });

    const result = await api.get("/test");
    expect(result).toEqual({ data: "success" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  /* it('should timeout if request takes too long', async () => {
    vi.useFakeTimers();
    // Mocking fetch to return a promise that we can control
    mockFetch.mockReturnValue(new Promise(() => {}));

    const promise = api.get('/test', { timeout: 100 });
    
    // Fast-forward time
    vi.advanceTimersByTime(200);
    
    // We expect the abort controller to have been triggered
    await expect(promise).rejects.toThrow();
    vi.useRealTimers();
  }); */
});
