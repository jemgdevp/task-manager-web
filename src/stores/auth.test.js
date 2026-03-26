import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("@/plugins/axios", () => ({
  AUTH_TOKEN_KEY: "auth_token",
  api: {
    post: vi.fn(),
  },
}));

import { api } from "@/plugins/axios";
import { useAuthStore } from "./auth";

const createStorageMock = () => {
  let store = {};

  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe("auth store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    Object.defineProperty(globalThis, "localStorage", {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("hydrates auth state from localStorage", () => {
    localStorage.setItem("auth_token", "token-123");
    localStorage.setItem("auth_user", JSON.stringify({ id: 10, name: "Jane" }));

    const authStore = useAuthStore();
    authStore.hydrateFromStorage();

    expect(authStore.token).toBe("token-123");
    expect(authStore.user).toMatchObject({ id: 10, name: "Jane" });
    expect(authStore.isAuthenticated).toBe(true);
  });

  it("login persists user and token", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        user: { id: 1, name: "Juan" },
        token: "abc-token",
      },
    });

    const authStore = useAuthStore();
    await authStore.login("juan@example.com", "password123");

    expect(api.post).toHaveBeenCalledWith("/api/login", {
      email: "juan@example.com",
      password: "password123",
    });
    expect(authStore.user).toMatchObject({ id: 1, name: "Juan" });
    expect(authStore.token).toBe("abc-token");
    expect(localStorage.getItem("auth_token")).toBe("abc-token");
    expect(JSON.parse(localStorage.getItem("auth_user"))).toMatchObject({
      id: 1,
      name: "Juan",
    });
  });

  it("register sends password_confirmation and supports nested payload", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        data: {
          user: { id: 2, name: "Ana" },
          token: "nested-token",
        },
      },
    });

    const authStore = useAuthStore();
    await authStore.register("Ana", "ana@example.com", "password123", "password123");

    expect(api.post).toHaveBeenCalledWith("/api/register", {
      name: "Ana",
      email: "ana@example.com",
      password: "password123",
      password_confirmation: "password123",
    });
    expect(authStore.token).toBe("nested-token");
    expect(authStore.user).toMatchObject({ id: 2, name: "Ana" });
  });

  it("supports register responses using access_token", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        user: { id: 3, name: "Leo" },
        access_token: "access-token-1",
      },
    });

    const authStore = useAuthStore();
    await authStore.register("Leo", "leo@example.com", "password123", "password123");

    expect(authStore.token).toBe("access-token-1");
    expect(authStore.user).toMatchObject({ id: 3, name: "Leo" });
  });

  it("falls back to login when register does not return token", async () => {
    api.post
      .mockResolvedValueOnce({
        data: {
          user: { id: 4, name: "Mia" },
          message: "Registered",
        },
      })
      .mockResolvedValueOnce({
        data: {
          user: { id: 4, name: "Mia" },
          token: "login-token-after-register",
        },
      });

    const authStore = useAuthStore();
    await authStore.register("Mia", "mia@example.com", "password123", "password123");

    expect(api.post).toHaveBeenNthCalledWith(1, "/api/register", {
      name: "Mia",
      email: "mia@example.com",
      password: "password123",
      password_confirmation: "password123",
    });

    expect(api.post).toHaveBeenNthCalledWith(2, "/api/login", {
      email: "mia@example.com",
      password: "password123",
    });

    expect(authStore.token).toBe("login-token-after-register");
    expect(authStore.user).toMatchObject({ id: 4, name: "Mia" });
  });

  it("logout always clears local auth state", async () => {
    api.post.mockRejectedValueOnce(new Error("logout failed"));

    const authStore = useAuthStore();
    authStore.token = "stale-token";
    authStore.user = { id: 99, name: "Stale" };
    authStore.persistAuth();

    await authStore.logout();

    expect(authStore.token).toBeNull();
    expect(authStore.user).toBeNull();
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
  });

  it("marks account as needing verification when login response has email_verified false", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        user: { id: 7, name: "NoVerify", email_verified: false },
        token: "token-no-verify",
      },
    });

    const authStore = useAuthStore();
    const result = await authStore.login("nverify@example.com", "password123");

    expect(authStore.isEmailVerified).toBe(false);
    expect(authStore.needsEmailVerification).toBe(true);
    expect(result.needsEmailVerification).toBe(true);
  });

  it("resends verification email and stores success notice", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        message: "Verification link sent.",
      },
    });

    const authStore = useAuthStore();
    authStore.token = "valid-token";
    authStore.user = { id: 1, email_verified: false };

    const response = await authStore.resendVerificationEmail();

    expect(api.post).toHaveBeenCalledWith("/api/email/verification-notification");
    expect(response).toMatchObject({ status: 200, message: "Verification link sent." });
    expect(authStore.verificationNotice).toBe("Verification link sent.");
    expect(authStore.verificationNoticeType).toBe("success");
  });

  it("handles resend verification 401 by clearing auth", async () => {
    api.post.mockRejectedValueOnce({
      status: 401,
      message: "Unauthenticated.",
    });

    const authStore = useAuthStore();
    authStore.token = "expired-token";
    authStore.user = { id: 10, email_verified: false };

    await expect(authStore.resendVerificationEmail()).rejects.toMatchObject({ status: 401 });

    expect(authStore.token).toBeNull();
    expect(authStore.user).toBeNull();
    expect(authStore.verificationNoticeType).toBe("error");
  });
});
