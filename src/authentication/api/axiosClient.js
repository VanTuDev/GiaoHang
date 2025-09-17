import axios from "axios";

// Simple axios instance. Interceptors are added in useAxiosAuth.
export const axiosClient = axios.create({
   baseURL: "/",
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


