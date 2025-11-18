import axiosClient from "../../../authentication/api/axiosClient";
import { CHAT_ENDPOINTS } from "./endpoints";

export const chatService = {
   getMeta: (orderId, params) =>
      axiosClient.get(CHAT_ENDPOINTS.meta(orderId), { params }),

   getHistory: (orderId, params) =>
      axiosClient.get(CHAT_ENDPOINTS.history(orderId), { params }),

   sendMessage: (payload) =>
      axiosClient.post(CHAT_ENDPOINTS.send, payload),

   longPoll: (orderId, { params, signal } = {}) =>
      axiosClient.get(CHAT_ENDPOINTS.longPoll(orderId), {
         params,
         signal,
         timeout: 35000
      })
};

