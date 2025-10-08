import axiosClient from "../../../authentication/api/axiosClient";
import { FEEDBACK_ENDPOINTS } from "./endpoints";

export const feedbackService = {
   // Customer: Tạo đánh giá dịch vụ
   createFeedback: (payload) => axiosClient.post(FEEDBACK_ENDPOINTS.createFeedback, payload),

   // Customer: Lấy đánh giá của mình
   getMyFeedbacks: (params) => axiosClient.get(FEEDBACK_ENDPOINTS.myFeedbacks, { params }),

   // Public: Lấy đánh giá của driver
   getDriverFeedbacks: (driverId, params) => axiosClient.get(FEEDBACK_ENDPOINTS.driverFeedbacks(driverId), { params }),

   // Lấy đánh giá của đơn hàng
   getOrderFeedbacks: (orderId) => axiosClient.get(FEEDBACK_ENDPOINTS.orderFeedbacks(orderId)),

   // Admin: Lấy tất cả đánh giá
   getAllFeedbacks: (params) => axiosClient.get(FEEDBACK_ENDPOINTS.adminAllFeedbacks, { params }),

   // Admin: Cập nhật trạng thái đánh giá
   updateFeedbackStatus: (feedbackId, payload) => axiosClient.put(FEEDBACK_ENDPOINTS.adminUpdateStatus(feedbackId), payload),
};
