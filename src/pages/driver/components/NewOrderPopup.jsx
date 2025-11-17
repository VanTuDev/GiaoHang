import React from 'react';
import { Modal, Button, Space, Tag, Divider } from 'antd';
import { 
   CheckCircleOutlined, 
   CloseCircleOutlined, 
   EnvironmentOutlined,
   DollarOutlined,
   CarOutlined,
   AppstoreOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../../utils/formatters';

const NewOrderPopup = ({ 
   visible, 
   orderData,
   onAccept,
   onReject,
   accepting = false,
   rejecting = false
}) => {
   if (!orderData) return null;

   const distanceKm = orderData.distanceFromDriver 
      ? (orderData.distanceFromDriver / 1000).toFixed(2) 
      : orderData.distanceKm || 'N/A';

   return (
      <Modal
         open={visible}
         closable={false}
         footer={null}
         centered
         width={500}
         maskClosable={false}
         className="new-order-popup"
         zIndex={9999}
         maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
         style={{ top: 20 }}
      >
         <div className="space-y-4">
            {/* Header */}
            <div className="text-center">
               <div className="mb-3">
                  <CarOutlined className="text-5xl text-blue-500 animate-pulse" />
               </div>
               <h3 className="text-2xl font-bold text-blue-600 mb-2">
                  Đơn hàng mới gần bạn!
               </h3>
               <p className="text-gray-600">
                  Có đơn hàng mới cách bạn <span className="font-semibold text-blue-600">{distanceKm} km</span>
               </p>
            </div>

            <Divider />

            {/* Thông tin đơn hàng */}
            <div className="space-y-3">
               <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2 mb-2">
                     <EnvironmentOutlined className="text-green-500 mt-1" />
                     <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600">Điểm lấy hàng</div>
                        <div className="text-sm">{orderData.pickupAddress}</div>
                     </div>
                  </div>
                  <div className="flex items-start space-x-2">
                     <EnvironmentOutlined className="text-red-500 mt-1" />
                     <div className="flex-1">
                        <div className="text-sm font-medium text-gray-600">Điểm giao hàng</div>
                        <div className="text-sm">{orderData.dropoffAddress}</div>
                     </div>
                  </div>
               </div>

               {/* Chi tiết đơn hàng */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                     <div className="flex items-center space-x-2 mb-1">
                        <AppstoreOutlined className="text-gray-500" />
                        <span className="text-sm text-gray-600">Trọng tải</span>
                     </div>
                     <div className="font-semibold">{orderData.weightKg?.toLocaleString() || 'N/A'} kg</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                     <div className="flex items-center space-x-2 mb-1">
                        <CarOutlined className="text-gray-500" />
                        <span className="text-sm text-gray-600">Khoảng cách</span>
                     </div>
                     <div className="font-semibold">{orderData.distanceKm || 'N/A'} km</div>
                  </div>
               </div>

               {/* Giá tiền */}
               <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <DollarOutlined className="text-green-600 text-xl" />
                        <span className="font-medium text-gray-700">Tổng giá trị</span>
                     </div>
                     <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(orderData.totalPrice || 0)}
                     </div>
                  </div>
               </div>

               {/* Ghi chú nếu có */}
               {orderData.customerNote && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                     <div className="text-sm font-medium text-yellow-700 mb-1">Ghi chú:</div>
                     <div className="text-sm text-yellow-600">{orderData.customerNote}</div>
                  </div>
               )}
            </div>

            <Divider />

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
               <Button
                  danger
                  size="large"
                  icon={<CloseCircleOutlined />}
                  onClick={onReject}
                  loading={rejecting}
                  disabled={accepting}
                  className="px-8"
               >
                  Từ chối
               </Button>
               <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={onAccept}
                  loading={accepting}
                  disabled={rejecting}
                  className="px-8 bg-green-600 hover:bg-green-700"
               >
                  Nhận đơn
               </Button>
            </div>

            {/* Thông báo tự động đóng */}
            <div className="text-center text-xs text-gray-500 mt-2">
               Popup sẽ tự động đóng sau 30 giây nếu không phản hồi
            </div>
         </div>
      </Modal>
   );
};

export default NewOrderPopup;

