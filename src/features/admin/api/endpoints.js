export const ADMIN_ENDPOINTS = {
   // Dashboard
   dashboard: "/api/admin/dashboard",

   // Quản lý người dùng
   users: "/api/admin/users",
   userById: (id) => `/api/admin/users/${id}`,

   // Quản lý tài xế
   drivers: "/api/admin/drivers",
   driverById: (id) => `/api/admin/drivers/${id}`,

   // Quản lý đơn hàng
   orders: "/api/admin/orders",

   // Báo cáo doanh thu
   revenue: "/api/admin/revenue",
};