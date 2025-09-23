export const DRIVER_ENDPOINTS = {
   apply: "/api/driver/apply",
   myApplication: "/api/driver/my-application",
   adminList: "/api/driver/admin/applications",
   adminReview: (id) => `/api/driver/admin/applications/${id}/review`,
   adminGetOne: (id) => `/api/driver/admin/applications/${id}`,
   getOne: (id) => `/api/driver/applications/${id}`,
};


