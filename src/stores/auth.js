/**
 * @file src/stores/auth.js
 * @description This file defines the authentication store using Pinia. It manages the user's authentication state, including login, logout, and registration actions.
 * @author jemgdevp
 * @date 2026-03-26
 */

import { defineStore } from "pinia";
import { api, AUTH_TOKEN_KEY } from "@/plugins/axios";

const AUTH_USER_KEY = "auth_user";

const normalizeEmailVerified = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["1", "true", "yes", "verified"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "unverified"].includes(normalized)) {
      return false;
    }
  }

  return Boolean(value);
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    emailVerificationRequired: false,
    verificationLoading: false,
    verificationNotice: null,
    verificationNoticeType: "info",
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isEmailVerified: (state) => Boolean(state.user?.email_verified),
    needsEmailVerification: (state) =>
      Boolean(state.token) &&
      (state.emailVerificationRequired || state.user?.email_verified === false),
  },
  actions: {
    hydrateFromStorage() {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);

      this.token = token;
      this.user = storedUser ? JSON.parse(storedUser) : null;

      if (this.user) {
        this.user = {
          ...this.user,
          email_verified: normalizeEmailVerified(this.user?.email_verified),
        };
      }

      this.emailVerificationRequired = Boolean(this.token) && this.user?.email_verified === false;
    },
    persistAuth() {
      if (this.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, this.token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }

      if (this.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    },
    clearAuth() {
      this.user = null;
      this.token = null;
      this.emailVerificationRequired = false;
      this.clearVerificationNotice();
      this.persistAuth();
    },
    clearVerificationNotice() {
      this.verificationNotice = null;
      this.verificationNoticeType = "info";
    },
    setVerificationNotice(message, type = "info") {
      this.verificationNotice = message;
      this.verificationNoticeType = type;
    },
    setUserEmailVerified(isVerified = true) {
      if (!this.user) {
        return;
      }

      this.user = {
        ...this.user,
        email_verified: Boolean(isVerified),
      };

      this.emailVerificationRequired = !isVerified;
      this.persistAuth();
    },
    resolveAuthPayload(responseData) {
      const nestedPayload = responseData?.data ?? null;
      const payload = nestedPayload ?? responseData ?? {};

      const token =
        payload.token ??
        payload.access_token ??
        payload.plainTextToken ??
        payload.plain_text_token ??
        responseData?.token ??
        responseData?.access_token ??
        responseData?.plainTextToken ??
        responseData?.plain_text_token ??
        null;

      const user =
        payload.user ??
        payload.data?.user ??
        responseData?.user ??
        responseData?.data?.user ??
        null;

      return {
        user,
        token,
      };
    },
    resolveVerificationState(responseData, user) {
      const nestedPayload = responseData?.data ?? null;
      const payload = nestedPayload ?? responseData ?? {};

      const userEmailVerifiedRaw =
        payload?.user?.email_verified ??
        payload?.data?.user?.email_verified ??
        responseData?.user?.email_verified ??
        responseData?.data?.user?.email_verified ??
        user?.email_verified ??
        null;

      const userEmailVerified = normalizeEmailVerified(userEmailVerifiedRaw);

      const emailVerificationRequired = Boolean(
        payload?.email_verification_required ??
          responseData?.email_verification_required ??
          (userEmailVerified === false),
      );

      return {
        userEmailVerified,
        emailVerificationRequired,
      };
    },
    async refreshCurrentUser() {
      if (!this.token) {
        return null;
      }

      const response = await api.get("/api/user");
      const responseData = response?.data ?? null;

      const userPayload =
        responseData?.data?.user ??
        responseData?.user ??
        responseData?.data ??
        responseData ??
        null;

      if (!userPayload || typeof userPayload !== "object") {
        return this.user;
      }

      const mergedUser = {
        ...(this.user ?? {}),
        ...userPayload,
      };

      const normalizedEmailVerified =
        normalizeEmailVerified(userPayload?.email_verified) ??
        normalizeEmailVerified(this.user?.email_verified);

      this.user = {
        ...mergedUser,
        email_verified: normalizedEmailVerified,
      };

      this.emailVerificationRequired = normalizedEmailVerified === false;
      this.persistAuth();

      return this.user;
    },
    async login(email, password) {
      this.loading = true;
      this.error = null;
      this.clearVerificationNotice();

      try {
        const response = await api.post("/api/login", { email, password });
        const { user, token } = this.resolveAuthPayload(response.data);
        const verificationState = this.resolveVerificationState(response.data, user);

        if (!token) {
          throw {
            status: 500,
            message: "Authentication token missing in response.",
          };
        }

        const normalizedUser = user
          ? {
              ...user,
              email_verified:
                verificationState.userEmailVerified ?? normalizeEmailVerified(user?.email_verified),
            }
          : null;

        this.user = normalizedUser;
        this.token = token;
        this.emailVerificationRequired =
          verificationState.userEmailVerified === null
            ? verificationState.emailVerificationRequired
            : !verificationState.userEmailVerified;
        this.persistAuth();

        const isEmailVerified = normalizeEmailVerified(normalizedUser?.email_verified) === true;

        return {
          user: normalizedUser,
          token,
          emailVerified: isEmailVerified,
          emailVerificationRequired: this.emailVerificationRequired,
          needsEmailVerification: this.emailVerificationRequired,
        };
      } catch (error) {
        this.error = error?.message ?? "Login failed.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async register(name, email, password, passwordConfirmation = password) {
      this.loading = true;
      this.error = null;
      this.clearVerificationNotice();

      try {
        const response = await api.post("/api/register", {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
        const { user, token } = this.resolveAuthPayload(response.data);
        const verificationState = this.resolveVerificationState(response.data, user);

        if (!token && user) {
          // Some backends register user successfully but do not return an auth token.
          // Attempt auto-login to complete the expected frontend flow.
          return await this.login(email, password);
        }

        if (!token) {
          throw {
            status: 500,
            message: "Registration succeeded but no authentication token was returned.",
          };
        }

        const normalizedUser = user
          ? {
              ...user,
              email_verified:
                verificationState.userEmailVerified ?? normalizeEmailVerified(user?.email_verified),
            }
          : null;

        this.user = normalizedUser;
        this.token = token;
        this.emailVerificationRequired =
          verificationState.userEmailVerified === null
            ? verificationState.emailVerificationRequired
            : !verificationState.userEmailVerified;
        this.persistAuth();

        const isEmailVerified = normalizeEmailVerified(normalizedUser?.email_verified) === true;

        return {
          user: normalizedUser,
          token,
          emailVerified: isEmailVerified,
          emailVerificationRequired: this.emailVerificationRequired,
          needsEmailVerification: this.emailVerificationRequired,
        };
      } catch (error) {
        this.error = error?.message ?? "Registration failed.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      this.loading = true;

      try {
        await api.post("/api/logout");
      } catch {
        // Ignore logout API errors and always clear local session.
      } finally {
        this.clearAuth();
        this.loading = false;
      }
    },
    async resendVerificationEmail() {
      this.verificationLoading = true;
      this.clearVerificationNotice();

      try {
        const response = await api.post("/api/email/verification-notification");
        const message = response?.data?.message ?? "Verification link sent.";

        const isAlreadyVerified = /already verified/i.test(message);

        if (isAlreadyVerified) {
          this.setUserEmailVerified(true);
          this.setVerificationNotice(message, "info");
        } else {
          this.setVerificationNotice(message, "success");
        }

        return {
          status: 200,
          message,
        };
      } catch (error) {
        if (error?.status === 401) {
          this.clearAuth();
          this.setVerificationNotice("Your session is invalid. Please login again.", "error");
        } else if (/already verified/i.test(error?.message ?? "")) {
          this.setUserEmailVerified(true);
          this.setVerificationNotice("Email is already verified.", "info");
        } else {
          this.setVerificationNotice(
            error?.message ?? "Could not resend verification email.",
            "error",
          );
        }

        throw error;
      } finally {
        this.verificationLoading = false;
      }
    },
  },
});
