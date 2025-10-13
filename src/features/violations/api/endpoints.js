export const VIOLATION_ENDPOINTS = {
   // Admin
   adminAllViolations: '/api/violations/admin/all',
   adminUpdateStatus: (violationId) => `/api/violations/admin/${violationId}/status`,

   // Customer
   reportViolation: '/api/violations',
   myReports: '/api/violations/my-reports',
};
