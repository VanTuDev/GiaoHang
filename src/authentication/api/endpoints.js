// Centralized API endpoint paths for authentication flows
// Base URL is handled by Vite proxy ("/api" -> http://localhost:8080)

export const AUTH_ENDPOINTS = {
   register: "/api/auth/register",
   verifyEmail: "/api/auth/verify-email",
   login: "/api/auth/login",
   me: "/api/auth/me",
   refresh: "/api/auth/refresh",
   logout: "/api/auth/logout",
   forgotPassword: "/api/auth/forgot-password",
   resetPassword: "/api/auth/reset-password",
};


