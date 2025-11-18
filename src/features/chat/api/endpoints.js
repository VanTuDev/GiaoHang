export const CHAT_ENDPOINTS = {
   send: '/api/chat/messages',
   history: (orderId) => `/api/chat/orders/${orderId}/messages`,
   meta: (orderId) => `/api/chat/orders/${orderId}/meta`,
   longPoll: (orderId) => `/api/chat/orders/${orderId}/long-poll`
};

