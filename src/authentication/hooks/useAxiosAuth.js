import { useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { AUTH_ENDPOINTS } from "../api/endpoints";

export function useAxiosAuth(accessToken, onRefresh) {
   useEffect(() => {
      const reqInterceptor = axiosClient.interceptors.request.use((config) => {
         if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
         }
         return config;
      });

      const resInterceptor = axiosClient.interceptors.response.use(
         (res) => res,
         async (error) => {
            const original = error.config;
            if (
               error.response?.status === 401 &&
               !original._retry &&
               typeof onRefresh === "function"
            ) {
               original._retry = true;
               try {
                  await onRefresh();
                  return axiosClient(original);
               } catch (e) {
                  // fallthrough
               }
            }
            return Promise.reject(error);
         }
      );

      return () => {
         axiosClient.interceptors.request.eject(reqInterceptor);
         axiosClient.interceptors.response.eject(resInterceptor);
      };
   }, [accessToken, onRefresh]);

   return axiosClient;
}


