import { apiRequest } from "../http";
import { AuthResponse, Me } from "../types";

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function register(email: string, password: string, role?: string) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: { email, password, role },
    auth: false,
  });
}

export function me() {
  return apiRequest<Me>("/auth/me");
}

export function logout(refreshToken: string) {
  return apiRequest<{ status: string }>("/auth/logout", {
    method: "POST",
    body: { refreshToken },
    auth: false,
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ status: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export function resetPassword(token: string, newPassword: string) {
  return apiRequest<{ status: string }>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
    auth: false,
  });
}
