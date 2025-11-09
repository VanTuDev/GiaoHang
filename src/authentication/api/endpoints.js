// Centralized API endpoint paths for authentication flows
// Base URL is handled by axiosClient (uses VITE_API_BASE_URL from .env)
// Development: Vite proxy ("/api" -> http://localhost:5000)
// Production: Uses VITE_API_BASE_URL environment variable

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


