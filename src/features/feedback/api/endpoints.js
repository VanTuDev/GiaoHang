export const FEEDBACK_ENDPOINTS = {
   // Customer
   createFeedback: "/api/feedback",
   myFeedbacks: "/api/feedback/my-feedbacks",

   // Public
   driverFeedbacks: (driverId) => `/api/feedback/driver/${driverId}`,

   // Admin
   adminAllFeedbacks: "/api/feedback/admin/all",
   adminUpdateStatus: (feedbackId) => `/api/feedback/admin/${feedbackId}/status`,
};
