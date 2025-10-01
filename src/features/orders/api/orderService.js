import axiosClient from "../../../authentication/api/axiosClient";
import { ORDER_ENDPOINTS } from "./endpoints";

export const orderService = {
   // Customer: Tạo đơn hàng mới
   createOrder: (payload) => axiosClient.post(ORDER_ENDPOINTS.createOrder, payload),

   // Customer: Lấy danh sách đơn hàng của mình
   getMyOrders: (params) => axiosClient.get(ORDER_ENDPOINTS.myOrders, { params }),

   // Xem chi tiết đơn hàng (Customer, Driver, Admin)
   getOrderDetail: (id) => axiosClient.get(ORDER_ENDPOINTS.orderDetail(id)),

   // Driver: Bật/tắt trạng thái online
   setDriverOnline: (online) => axiosClient.put(ORDER_ENDPOINTS.driverOnline, { online }),

   // Driver: Lấy danh sách đơn hàng đã nhận
   getDriverOrders: (params) => axiosClient.get(ORDER_ENDPOINTS.driverMyOrders, { params }),

   // Driver: Lấy danh sách đơn hàng có sẵn để nhận
   getAvailableOrders: (params) => axiosClient.get(ORDER_ENDPOINTS.driverAvailableOrders, { params }),

   // Driver: Nhận đơn hàng
   acceptItem: (orderId, itemId) => axiosClient.put(ORDER_ENDPOINTS.acceptItem(orderId, itemId)),

   // Driver: Cập nhật trạng thái đơn hàng
   updateItemStatus: (orderId, itemId, status) => axiosClient.put(ORDER_ENDPOINTS.updateItemStatus(orderId, itemId), { status }),

   // Customer: Huỷ đơn hàng
   cancelOrder: (orderId, reason) => axiosClient.put(ORDER_ENDPOINTS.cancelOrder(orderId), { reason }),

   // Customer: Cập nhật bảo hiểm đơn hàng
   updateOrderInsurance: (orderId, itemId, insurance) => axiosClient.put(ORDER_ENDPOINTS.updateOrderInsurance(orderId), { itemId, insurance }),
};