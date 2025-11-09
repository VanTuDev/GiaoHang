export const WITHDRAWAL_ENDPOINTS = {
   // Driver endpoints
   createRequest: '/api/driver/withdrawal/request',
   getHistory: '/api/driver/withdrawal/history',
   getDetail: (id) => `/api/driver/withdrawal/${id}`,
   
   // Admin endpoints
   adminList: '/api/admin/withdrawals',
   adminDetail: (id) => `/api/admin/withdrawals/${id}`,
   adminApprove: (id) => `/api/admin/withdrawals/${id}/approve`,
   adminReject: (id) => `/api/admin/withdrawals/${id}/reject`,
   adminComplete: (id) => `/api/admin/withdrawals/${id}/complete`,
   adminStats: '/api/admin/withdrawals/stats',
};

