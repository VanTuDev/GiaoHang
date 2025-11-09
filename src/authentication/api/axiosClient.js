import axios from "axios";

// Lấy API base URL từ biến môi trường
// Development: Luôn dùng "/" để proxy qua Vite (vite.config.js) - bỏ qua VITE_API_BASE_URL
// Production: Phải set VITE_API_BASE_URL trong Vercel Environment Variables
// Lý do: Khi truy cập từ mobile qua IP, localhost không hoạt động, cần dùng proxy
const API_BASE_URL = import.meta.env.DEV 
   ? "/"  // Development: luôn dùng proxy để hoạt động với cả localhost và IP
   : (import.meta.env.VITE_API_BASE_URL || ""); // Production: dùng VITE_API_BASE_URL

// Warning nếu không có API URL trong production
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
   console.warn("⚠️ VITE_API_BASE_URL chưa được cấu hình! Vui lòng thêm biến môi trường trong Vercel.");
}

// Log để debug
if (import.meta.env.DEV) {
   console.log("🔧 [DEV MODE] Sử dụng Vite proxy:", API_BASE_URL);
   console.log("🔧 [DEV MODE] VITE_API_BASE_URL từ .env (không dùng trong DEV):", import.meta.env.VITE_API_BASE_URL);
}

// Simple axios instance. Interceptors are added in useAxiosAuth.
export const axiosClient = axios.create({
   baseURL: API_BASE_URL,
   headers: {
      "Content-Type": "application/json",
   },
});

// Always attach Bearer token from localStorage
axiosClient.interceptors.request.use((config) => {
   try {
      const token = localStorage.getItem("accessToken");
      if (token) {
         config.headers = config.headers || {};
         if (!config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
         }
      }
   } catch { }
   return config;
});

// Log responses for easier debugging as requested
axiosClient.interceptors.response.use(
   (response) => {
      // eslint-disable-next-line no-console
      console.log("[API RESPONSE]", {
         url: response.config?.url,
         status: response.status,
         data: response.data,
      });
      return response;
   },
   (error) => {
      // eslint-disable-next-line no-console
      console.error("[API ERROR]", {
         url: error.config?.url,
         status: error.response?.status,
         data: error.response?.data,
         message: error.message,
      });
      return Promise.reject(error);
   }
);

export default axiosClient;


