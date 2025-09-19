import { useEffect } from "react";
import axiosClient from "../api/axiosClient";
export function useAxiosAuth(accessToken) {
   useEffect(() => {
      const reqInterceptor = axiosClient.interceptors.request.use((config) => {
         if (accessToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
         }
         return config;
      });

      const resInterceptor = axiosClient.interceptors.response.use((res) => res);

      return () => {
         axiosClient.interceptors.request.eject(reqInterceptor);
         axiosClient.interceptors.response.eject(resInterceptor);
      };
   }, [accessToken]);

   return axiosClient;
}


