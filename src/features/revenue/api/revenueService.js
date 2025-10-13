import axiosClient from "../../../authentication/api/axiosClient";
import { REVENUE_ENDPOINTS } from "./endpoints";

export const revenueService = {
   // Lấy tổng quan doanh thu
   getOverview: () => axiosClient.get(REVENUE_ENDPOINTS.overview),

   // Lấy thống kê doanh thu theo thời gian
   getStats: (params) => axiosClient.get(REVENUE_ENDPOINTS.stats, { params }),

   // Lấy danh sách giao dịch
   getTransactions: (params) => axiosClient.get(REVENUE_ENDPOINTS.transactions, { params }),
};

