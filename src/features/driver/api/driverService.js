import axiosClient from "../../../authentication/api/axiosClient";
import { DRIVER_ENDPOINTS } from "./endpoints";

export const driverService = {
   apply: (formData) => axiosClient.post(DRIVER_ENDPOINTS.apply, formData, { headers: { "Content-Type": "multipart/form-data" } }),
   myApplication: () => axiosClient.get(DRIVER_ENDPOINTS.myApplication),
   adminList: (params) => axiosClient.get(DRIVER_ENDPOINTS.adminList, { params }),
   adminReview: (id, payload) => axiosClient.put(DRIVER_ENDPOINTS.adminReview(id), payload),
   adminGetOne: (id) => axiosClient.get(DRIVER_ENDPOINTS.adminGetOne(id)),
   getOne: (id) => axiosClient.get(DRIVER_ENDPOINTS.getOne(id)),
};


