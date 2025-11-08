export const DRIVER_ENDPOINTS = {
   apply: "/api/driver/apply",
   myApplication: "/api/driver/my-application",
   adminList: "/api/driver/admin/applications",
   adminReview: (id) => `/api/driver/admin/applications/${id}/review`,
   adminGetOne: (id) => `/api/driver/admin/applications/${id}`,
   getOne: (id) => `/api/driver/applications/${id}`,
   districts: "/api/driver/districts", // Endpoint để lấy danh sách quận/huyện
   updateServiceAreas: "/api/profile/driver/service-areas", // Endpoint để cập nhật khu vực hoạt động
   info: "/api/profile/driver", // Endpoint để lấy thông tin tài xế
   updateProfile: "/api/profile", // Endpoint để cập nhật thông tin cá nhân
   uploadAvatar: "/api/profile/avatar", // Endpoint để cập nhật avatar
  updateBank: "/api/profile/driver/bank", // Cập nhật thông tin ngân hàng
};