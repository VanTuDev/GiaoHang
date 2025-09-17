import axiosClient from "./axiosClient";
import { AUTH_ENDPOINTS } from "./endpoints";

export const authService = {
   register: (payload) => axiosClient.post(AUTH_ENDPOINTS.register, payload),
   verifyEmail: (payload) => axiosClient.post(AUTH_ENDPOINTS.verifyEmail, payload),
   login: (payload) => axiosClient.post(AUTH_ENDPOINTS.login, payload),
   me: () => axiosClient.get(AUTH_ENDPOINTS.me),
   refresh: (refreshToken) => axiosClient.post(AUTH_ENDPOINTS.refresh, { refreshToken }),
   logout: (refreshToken) => axiosClient.post(AUTH_ENDPOINTS.logout, { refreshToken }),
   forgotPassword: (email) => axiosClient.post(AUTH_ENDPOINTS.forgotPassword, { email }),
   resetPassword: (payload) => axiosClient.post(AUTH_ENDPOINTS.resetPassword, payload),
};


