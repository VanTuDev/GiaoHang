import axiosClient from "../../../authentication/api/axiosClient";
import { VIOLATION_ENDPOINTS } from "./endpoints";

export const violationService = {
   // Admin: Lấy tất cả báo cáo vi phạm
   getAllViolations: (params) => axiosClient.get(VIOLATION_ENDPOINTS.adminAllViolations, { params }),

   // Admin: Cập nhật trạng thái báo cáo
   updateViolationStatus: (violationId, payload) =>
      axiosClient.put(VIOLATION_ENDPOINTS.adminUpdateStatus(violationId), payload),

   // Customer: Báo cáo vi phạm
   reportViolation: (payload) => axiosClient.post(VIOLATION_ENDPOINTS.reportViolation, payload),

   // Customer: Lấy báo cáo của mình
   getMyReports: (params) => axiosClient.get(VIOLATION_ENDPOINTS.myReports, { params }),
};
