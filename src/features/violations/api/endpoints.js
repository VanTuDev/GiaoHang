export const VIOLATION_ENDPOINTS = {
   // Admin
   adminAllViolations: '/api/violations/admin/all',
   adminUpdateStatus: (violationId) => `/api/violations/admin/${violationId}/status`,

   // Customer
   reportViolation: '/api/violations/report',  // ✅ Đã sửa: thêm /report
   myReports: '/api/violations/my-reports',
};
