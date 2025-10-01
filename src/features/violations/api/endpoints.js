export const VIOLATION_ENDPOINTS = {
   // Customer
   reportViolation: "/api/violations/report",
   myReports: "/api/violations/my-reports",
   
   // Admin
   adminAllViolations: "/api/violations/admin/all",
   adminUpdateStatus: (violationId) => `/api/violations/admin/${violationId}/status`,
   adminStats: "/api/violations/admin/stats",
};
