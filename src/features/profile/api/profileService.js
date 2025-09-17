import axiosClient from "../../../authentication/api/axiosClient";
import { PROFILE_ENDPOINTS } from "./endpoints";

export const profileService = {
   me: () => axiosClient.get(PROFILE_ENDPOINTS.me),
   updateMe: (payload) => axiosClient.put(PROFILE_ENDPOINTS.updateMe, payload),
   uploadAvatar: (file) => {
      const form = new FormData();
      form.append("file", file);
      return axiosClient.post(PROFILE_ENDPOINTS.uploadAvatar, form, {
         headers: { "Content-Type": "multipart/form-data" },
      });
   },
   driverMe: () => axiosClient.get(PROFILE_ENDPOINTS.driverMe),
   updateDriverMe: (payload) => axiosClient.put(PROFILE_ENDPOINTS.updateDriverMe, payload),
   uploadDriverAvatar: (file) => {
      const form = new FormData();
      form.append("file", file);
      return axiosClient.post(PROFILE_ENDPOINTS.uploadDriverAvatar, form, {
         headers: { "Content-Type": "multipart/form-data" },
      });
   },
   upsertVehicle: (payload) => axiosClient.put(PROFILE_ENDPOINTS.upsertVehicle, payload),
   uploadVehiclePhoto: (file) => {
      const form = new FormData();
      form.append("file", file);
      return axiosClient.post(PROFILE_ENDPOINTS.uploadVehiclePhoto, form, {
         headers: { "Content-Type": "multipart/form-data" },
      });
   },
};


