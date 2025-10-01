import axiosClient from "../../../authentication/api/axiosClient";
import { PROFILE_ENDPOINTS } from "./endpoints";
import { uploadToCloudinary } from "../../../utils/cloudinaryService";

export const profileService = {
   me: () => axiosClient.get(PROFILE_ENDPOINTS.me),
   updateMe: (payload) => axiosClient.put(PROFILE_ENDPOINTS.updateMe, payload),

   // Upload avatar thông qua Cloudinary và cập nhật URL
   uploadAvatar: async (file) => {
      try {
         // Upload file lên Cloudinary
         const result = await uploadToCloudinary(file, 'avatars');

         // Gửi URL đến API backend
         return axiosClient.post(PROFILE_ENDPOINTS.uploadAvatar, {
            avatarUrl: result.url
         });
      } catch (error) {
         console.error("Lỗi khi upload avatar:", error);
         throw error;
      }
   },

   driverMe: () => axiosClient.get(PROFILE_ENDPOINTS.driverMe),
   updateDriverMe: (payload) => axiosClient.put(PROFILE_ENDPOINTS.updateDriverMe, payload),

   // Upload avatar cho tài xế
   uploadDriverAvatar: async (file) => {
      try {
         // Upload file lên Cloudinary
         const result = await uploadToCloudinary(file, 'avatars');

         // Gửi URL đến API backend
         return axiosClient.post(PROFILE_ENDPOINTS.uploadDriverAvatar, {
            avatarUrl: result.url
         });
      } catch (error) {
         console.error("Lỗi khi upload avatar tài xế:", error);
         throw error;
      }
   },

   upsertVehicle: (payload) => axiosClient.put(PROFILE_ENDPOINTS.upsertVehicle, payload),

   // Upload ảnh xe
   uploadVehiclePhoto: async (file) => {
      try {
         // Upload file lên Cloudinary
         const result = await uploadToCloudinary(file, 'vehicles');
         return { data: { success: true, data: { url: result.url } } };
      } catch (error) {
         console.error("Lỗi khi upload ảnh xe:", error);
         throw error;
      }
   },
};