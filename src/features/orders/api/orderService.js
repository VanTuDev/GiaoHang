import axiosClient from "../../../authentication/api/axiosClient";
import { ORDER_ENDPOINTS } from "./endpoints";

export const orderService = {
   setDriverOnline: (online) => axiosClient.put(ORDER_ENDPOINTS.driverOnline, { online }),
   acceptItem: (orderId, itemId) => axiosClient.put(ORDER_ENDPOINTS.acceptItem(orderId, itemId)),
   updateItemStatus: (orderId, itemId, status) => axiosClient.put(ORDER_ENDPOINTS.updateItemStatus(orderId, itemId), { status }),
   createOrder: (payload) => axiosClient.post(ORDER_ENDPOINTS.createOrder, payload),
};


