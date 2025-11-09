import axiosClient from '../../../authentication/api/axiosClient';
import { WITHDRAWAL_ENDPOINTS } from './endpoints';

export const withdrawalService = {
   // Driver: Tạo yêu cầu rút tiền
   createRequest: (data) => axiosClient.post(WITHDRAWAL_ENDPOINTS.createRequest, data),

   // Driver: Lấy lịch sử yêu cầu
   getHistory: (params) => axiosClient.get(WITHDRAWAL_ENDPOINTS.getHistory, { params }),

   // Driver: Lấy chi tiết yêu cầu
   getDetail: (id) => axiosClient.get(WITHDRAWAL_ENDPOINTS.getDetail(id)),

   // Admin: Lấy danh sách tất cả yêu cầu
   adminList: (params) => axiosClient.get(WITHDRAWAL_ENDPOINTS.adminList, { params }),

   // Admin: Lấy chi tiết yêu cầu
   adminDetail: (id) => axiosClient.get(WITHDRAWAL_ENDPOINTS.adminDetail(id)),

   // Admin: Chấp thuận yêu cầu
   adminApprove: (id, data) => axiosClient.put(WITHDRAWAL_ENDPOINTS.adminApprove(id), data),

   // Admin: Từ chối yêu cầu
   adminReject: (id, data) => axiosClient.put(WITHDRAWAL_ENDPOINTS.adminReject(id), data),

   // Admin: Hoàn thành chuyển tiền
   adminComplete: (id, data) => axiosClient.put(WITHDRAWAL_ENDPOINTS.adminComplete(id), data),

   // Admin: Thống kê
   adminStats: (params) => axiosClient.get(WITHDRAWAL_ENDPOINTS.adminStats, { params }),
};

