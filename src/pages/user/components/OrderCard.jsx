import React, { useState } from "react";
import { Card, Tag, Button, Space, Modal, Descriptions, message } from "antd";
import {
   TruckOutlined,
   EnvironmentOutlined,
   ClockCircleOutlined,
   PhoneOutlined,
   UserOutlined,
   StarFilled,
   EyeOutlined,
   ExclamationCircleOutlined,
   DollarCircleOutlined,
   StarOutlined,
   WarningOutlined
} from "@ant-design/icons";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import OrderItemCard from "./OrderItemCard";
import CancelOrderModal from "./CancelOrderModal";
import FeedbackModal from "./FeedbackModal";
import ReportViolationModal from "./ReportViolationModal";

const OrderCard = ({ order, onRefresh }) => {
   const [detailModalOpen, setDetailModalOpen] = useState(false);
   const [cancelModalOpen, setCancelModalOpen] = useState(false);
   const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
   const [reportModalOpen, setReportModalOpen] = useState(false);
   const [cancelling, setCancelling] = useState(false);

   const getStatusConfig = (status) => {
      const configs = {
         Created: { label: "Đang tìm tài xế", color: "gold", icon: <ClockCircleOutlined /> },
         InProgress: { label: "Đang xử lý", color: "blue", icon: <TruckOutlined /> },
         Completed: { label: "Hoàn thành", color: "green", icon: <UserOutlined /> },
         Cancelled: { label: "Đã hủy", color: "red", icon: <ExclamationCircleOutlined /> },
      };
      return configs[status] || { label: status, color: "default", icon: <ClockCircleOutlined /> };
   };

   const statusConfig = getStatusConfig(order.status);

   const canCancel = order.status === 'Created' || order.status === 'InProgress';
   const canFeedback = order.status === 'Completed';
   const hasAcceptedItems = order.items?.some(item =>
      ['Accepted', 'PickedUp', 'Delivering'].includes(item.status)
   );
   const hasDeliveredItems = order.items?.some(item =>
      item.status === 'Delivered' && item.driverId
   );

   const handleCancelOrder = async (reason) => {
      setCancelling(true);
      try {
         const response = await orderService.cancelOrder(order._id, reason);
         if (response.data?.success) {
            message.success('Huỷ đơn hàng thành công');
            onRefresh?.();
         } else {
            message.error(response.data?.message || 'Có lỗi xảy ra');
         }
      } catch (error) {
         message.error(error.response?.data?.message || 'Có lỗi xảy ra khi huỷ đơn hàng');
      } finally {
         setCancelling(false);
      }
   };

   const handleUpdateInsurance = async (itemId, insurance) => {
      try {
         const response = await orderService.updateOrderInsurance(order._id, itemId, insurance);
         if (response.data?.success) {
            onRefresh?.();
         } else {
            throw new Error(response.data?.message || 'Có lỗi xảy ra');
         }
      } catch (error) {
         throw error;
      }
   };

   return (
      <>
         <Card
            className="mb-4"
            title={
               <div className="flex items-center justify-between">
                  <div className="flex items-center">
                     <TruckOutlined className="mr-2" />
                     <span className="font-medium">Đơn hàng #{order._id?.slice(-8)}</span>
                  </div>
                  <Tag color={statusConfig.color} icon={statusConfig.icon}>
                     {statusConfig.label}
                  </Tag>
               </div>
            }
            extra={
               <Space>
                  <Button
                     icon={<EyeOutlined />}
                     onClick={() => setDetailModalOpen(true)}
                  >
                     Chi tiết
                  </Button>
                  {canFeedback && hasDeliveredItems && (
                     <Button
                        type="primary"
                        icon={<StarOutlined />}
                        onClick={() => setFeedbackModalOpen(true)}
                     >
                        Đánh giá
                     </Button>
                  )}
                  {hasDeliveredItems && (
                     <Button
                        danger
                        icon={<WarningOutlined />}
                        onClick={() => setReportModalOpen(true)}
                     >
                        Báo cáo
                     </Button>
                  )}
                  {canCancel && !hasAcceptedItems && (
                     <Button
                        danger
                        icon={<ExclamationCircleOutlined />}
                        onClick={() => setCancelModalOpen(true)}
                     >
                        Huỷ đơn
                     </Button>
                  )}
               </Space>
            }
         >
            <div className="space-y-4">
               {/* Thông tin địa chỉ */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                     <EnvironmentOutlined className="mr-2 mt-1 text-green-500" />
                     <div>
                        <p className="font-medium text-sm">Địa chỉ lấy hàng:</p>
                        <p className="text-gray-600">{order.pickupAddress}</p>
                     </div>
                  </div>
                  <div className="flex items-start">
                     <EnvironmentOutlined className="mr-2 mt-1 text-red-500" />
                     <div>
                        <p className="font-medium text-sm">Địa chỉ giao hàng:</p>
                        <p className="text-gray-600">{order.dropoffAddress}</p>
                     </div>
                  </div>
               </div>

               {/* Thông tin tổng quan */}
               <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                     <DollarCircleOutlined className="mr-2 text-blue-500" />
                     <span className="font-medium">Tổng giá trị:</span>
                     <span className="ml-2 text-lg font-bold text-blue-600">
                        {formatCurrency(order.totalPrice)}
                     </span>
                  </div>
                  <div className="text-sm text-gray-500">
                     Tạo lúc: {formatDate(order.createdAt)}
                  </div>
               </div>

               {/* Danh sách items */}
               <div>
                  <h5 className="font-medium mb-2">Danh sách hàng hóa:</h5>
                  {order.items?.map((item, index) => (
                     <OrderItemCard
                        key={item._id || index}
                        item={item}
                        orderStatus={order.status}
                        onUpdateInsurance={handleUpdateInsurance}
                        canModify={canCancel && !hasAcceptedItems}
                     />
                  ))}
               </div>

               {/* Ghi chú */}
               {order.customerNote && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                     <p className="font-medium text-sm mb-1">Ghi chú:</p>
                     <p className="text-gray-600 text-sm">{order.customerNote}</p>
                  </div>
               )}

               {/* Cảnh báo */}
               {canCancel && hasAcceptedItems && (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                     <p className="text-orange-700 text-sm">
                        ⚠️ Không thể huỷ đơn hàng vì đã có tài xế nhận đơn.
                        Vui lòng liên hệ tài xế để thảo luận.
                     </p>
                  </div>
               )}
            </div>
         </Card>

         {/* Modal chi tiết đơn hàng */}
         <Modal
            title="Chi tiết đơn hàng"
            open={detailModalOpen}
            onCancel={() => setDetailModalOpen(false)}
            footer={null}
            width={800}
         >
            <Descriptions column={1} bordered>
               <Descriptions.Item label="Mã đơn hàng">
                  #{order._id?.slice(-8)}
               </Descriptions.Item>
               <Descriptions.Item label="Trạng thái">
                  <Tag color={statusConfig.color} icon={statusConfig.icon}>
                     {statusConfig.label}
                  </Tag>
               </Descriptions.Item>
               <Descriptions.Item label="Tổng giá trị">
                  {formatCurrency(order.totalPrice)}
               </Descriptions.Item>
               <Descriptions.Item label="Phương thức thanh toán">
                  {order.paymentMethod}
               </Descriptions.Item>
               <Descriptions.Item label="Trạng thái thanh toán">
                  <Tag color={order.paymentStatus === 'Paid' ? 'green' : 'orange'}>
                     {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Tag>
               </Descriptions.Item>
               <Descriptions.Item label="Ngày tạo">
                  {formatDate(order.createdAt)}
               </Descriptions.Item>
               {order.customerNote && (
                  <Descriptions.Item label="Ghi chú">
                     {order.customerNote}
                  </Descriptions.Item>
               )}
            </Descriptions>
         </Modal>

         {/* Modal huỷ đơn hàng */}
         <CancelOrderModal
            open={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            onConfirm={handleCancelOrder}
            loading={cancelling}
            orderInfo={order}
         />

         {/* Modal đánh giá dịch vụ */}
         <FeedbackModal
            open={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            order={order}
            onSuccess={() => {
               message.success('Đánh giá đã được gửi thành công!');
               onRefresh?.();
            }}
         />

         {/* Modal báo cáo vi phạm */}
         <ReportViolationModal
            open={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            driver={order.items?.find(item => item.status === 'Delivered' && item.driverId)?.driverId}
            order={order}
            onSuccess={() => {
               message.success('Báo cáo vi phạm đã được gửi thành công!');
               onRefresh?.();
            }}
         />
      </>
   );
};

export default OrderCard;
