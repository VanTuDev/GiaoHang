export const ORDER_ENDPOINTS = {
   driverOnline: "/orders/driver/online",
   acceptItem: (orderId, itemId) => `/orders/${orderId}/items/${itemId}/accept`,
   updateItemStatus: (orderId, itemId) => `/orders/${orderId}/items/${itemId}/status`,
   createOrder: "/orders",
};


