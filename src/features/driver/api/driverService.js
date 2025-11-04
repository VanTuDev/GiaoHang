import axiosClient from "../../../authentication/api/axiosClient";
import { DRIVER_ENDPOINTS } from "./endpoints";

export const driverService = {
   apply: (formData) => axiosClient.post(DRIVER_ENDPOINTS.apply, formData, { headers: { "Content-Type": "multipart/form-data" } }),
   myApplication: () => axiosClient.get(DRIVER_ENDPOINTS.myApplication),
   adminList: (params) => axiosClient.get(DRIVER_ENDPOINTS.adminList, { params }),
   adminReview: (id, payload) => axiosClient.put(DRIVER_ENDPOINTS.adminReview(id), payload),
   adminGetOne: (id) => axiosClient.get(DRIVER_ENDPOINTS.adminGetOne(id)),
   getOne: (id) => axiosClient.get(DRIVER_ENDPOINTS.getOne(id)),

   // Lấy danh sách quận/huyện
   getDistricts: () => axiosClient.get(DRIVER_ENDPOINTS.districts),

   // Cập nhật khu vực hoạt động
   updateServiceAreas: (serviceAreas) => axiosClient.put(DRIVER_ENDPOINTS.updateServiceAreas, { serviceAreas }),

   // Lấy thông tin tài xế
   getDriverInfo: () => axiosClient.get(DRIVER_ENDPOINTS.info),

   // Cập nhật thông tin cá nhân
   updateProfile: (data) => axiosClient.put(DRIVER_ENDPOINTS.updateProfile, data),

   // Upload avatar
   uploadAvatar: (data) => axiosClient.post(DRIVER_ENDPOINTS.uploadAvatar, data),

  // Cập nhật thông tin ngân hàng
  updateBank: (data) => axiosClient.put(DRIVER_ENDPOINTS.updateBank, data),
};