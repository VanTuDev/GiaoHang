import axiosClient from "../../../authentication/api/axiosClient";
import { ADMIN_ENDPOINTS } from "./endpoints";

export const adminService = {
   // Dashboard
   getDashboardStats: () => axiosClient.get(ADMIN_ENDPOINTS.dashboard),

   // Quản lý người dùng
   listUsers: (params) => axiosClient.get(ADMIN_ENDPOINTS.users, { params }),
   getUser: (id) => axiosClient.get(ADMIN_ENDPOINTS.userById(id)),

   // Quản lý tài xế
   listDrivers: (params) => axiosClient.get(ADMIN_ENDPOINTS.drivers, { params }),
   getDriverDetail: (id) => axiosClient.get(ADMIN_ENDPOINTS.driverById(id)),

   // Quản lý đơn hàng
   listOrders: (params) => axiosClient.get(ADMIN_ENDPOINTS.orders, { params }),

   // Báo cáo doanh thu
   getRevenueReport: (params) => axiosClient.get(ADMIN_ENDPOINTS.revenue, { params }),
};