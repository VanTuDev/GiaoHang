export const ORDER_ENDPOINTS = {
   // Customer
   createOrder: "/api/orders",
   myOrders: "/api/orders/my-orders",
   orderDetail: (id) => `/api/orders/${id}`,

   // Driver
   driverOnline: "/api/orders/driver/online",
   driverMyOrders: "/api/orders/driver/my-orders",
   driverAvailableOrders: "/api/orders/driver/available",
   acceptItem: (orderId, itemId) => `/api/orders/${orderId}/items/${itemId}/accept`,
   updateItemStatus: (orderId, itemId) => `/api/orders/${orderId}/items/${itemId}/status`,
};