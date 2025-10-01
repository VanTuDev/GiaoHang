import axiosClient from "../../../authentication/api/axiosClient";
import { VEHICLE_ENDPOINTS } from "./endpoints";

export const vehicleService = {
   // Lấy danh sách loại xe
   getTypes: (params) => axiosClient.get(VEHICLE_ENDPOINTS.types, { params }),

   // Lấy danh sách xe (có thể lọc)
   listVehicles: (params) => axiosClient.get(VEHICLE_ENDPOINTS.list, { params }),

   // Tài xế: Lấy danh sách xe của mình
   getMyVehicles: () => axiosClient.get(VEHICLE_ENDPOINTS.myVehicles),

   // Tài xế: Thêm xe mới
   addVehicle: (data) => {
      return axiosClient.post(VEHICLE_ENDPOINTS.addVehicle, data);
   },

   // Tài xế: Cập nhật thông tin xe
   updateVehicle: (id, data) => {
      return axiosClient.put(VEHICLE_ENDPOINTS.updateVehicle(id), data);
   },

   // Tài xế: Xóa xe
   deleteVehicle: (id) => axiosClient.delete(VEHICLE_ENDPOINTS.deleteVehicle(id)),
};