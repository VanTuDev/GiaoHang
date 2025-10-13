import React from 'react';
import { Card, Row, Col, Tag, Button, Avatar, Space } from 'antd';
import {
   TruckOutlined,
   EnvironmentOutlined,
   ClockCircleOutlined,
   PhoneOutlined,
   UserOutlined,
   StarFilled,
   EyeOutlined,
   StarOutlined,
   WarningOutlined
} from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const statusConfig = {
   Created: { label: "Đang tìm tài xế", color: "gold", icon: <ClockCircleOutlined /> },
   Accepted: { label: "Đã có tài xế", color: "blue", icon: <UserOutlined /> },
   PickedUp: { label: "Đã lấy hàng", color: "purple", icon: <TruckOutlined /> },
   Delivering: { label: "Đang giao", color: "orange", icon: <TruckOutlined /> },
   Delivered: { label: "Đã giao", color: "green", icon: <TruckOutlined /> },
   Cancelled: { label: "Đã hủy", color: "red", icon: <ClockCircleOutlined /> },
};

export default function OrderCard({ order, onViewDetail, onOpenFeedback, onOpenReport }) {
   const hasDeliveredItems = order.items.some(item => item.status === 'Delivered');
   const hasDriver = order.items.some(item => item.status === 'Delivered' && item.driverId);
   const activeDriver = order.items.find(item => item.driverId)?.driverId;

   const getBorderColor = () => {
      if (hasDeliveredItems) return 'border-l-green-500';
      if (order.items.some(item => ['Accepted', 'PickedUp', 'Delivering'].includes(item.status))) {
         return 'border-l-blue-500';
      }
      return 'border-l-yellow-500';
   };

   const renderStatus = (status) => {
      const config = statusConfig[status] || { label: status, color: "default", icon: <ClockCircleOutlined /> };
      return (
         <Tag color={config.color} className="font-medium">
            {config.icon}
            <span className="ml-1">{config.label}</span>
         </Tag>
      );
   };

   return (
      <Card
         className={`shadow-md hover:shadow-xl transition-all duration-300 border-l-4 ${getBorderColor()}`}
         bodyStyle={{ padding: '20px' }}
      >
         {/* Header */}
         <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <TruckOutlined className="text-white text-xl" />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-gray-800">#{order._id.substring(0, 8).toUpperCase()}</h3>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt, true)}</p>
               </div>
            </div>
            <div className="text-right">
               <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  {formatCurrency(order.totalPrice)}
               </div>
               <p className="text-xs text-gray-500">Tổng giá trị</p>
            </div>
         </div>

         {/* Addresses */}
         <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
            <Row gutter={[16, 12]}>
               <Col span={24}>
                  <div className="flex items-start space-x-2">
                     <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <EnvironmentOutlined className="text-green-600" />
                     </div>
                     <div className="flex-1">
                        <p className="text-xs font-medium text-green-700 mb-1">Điểm lấy hàng</p>
                        <p className="text-sm text-gray-700">{order.pickupAddress}</p>
                     </div>
                  </div>
               </Col>
               <Col span={24}>
                  <div className="flex items-start space-x-2">
                     <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <EnvironmentOutlined className="text-red-600" />
                     </div>
                     <div className="flex-1">
                        <p className="text-xs font-medium text-red-700 mb-1">Điểm giao hàng</p>
                        <p className="text-sm text-gray-700">{order.dropoffAddress}</p>
                     </div>
                  </div>
               </Col>
            </Row>
         </div>

         {/* Items Summary */}
         <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
               <div key={index} className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center space-x-3 flex-1">
                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TruckOutlined className="text-blue-600" />
                     </div>
                     <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.vehicleType}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                           <span>📦 {item.weightKg}kg</span>
                           <span>📏 {item.distanceKm}km</span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right ml-4">
                     {renderStatus(item.status)}
                     <p className="text-sm font-semibold text-blue-600 mt-1">
                        {formatCurrency(item.priceBreakdown?.total || 0)}
                     </p>
                  </div>
               </div>
            ))}
         </div>

         {/* Driver Info */}
         {activeDriver ? (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-4 border border-purple-100">
               <div className="flex items-center space-x-3">
                  <Avatar
                     src={activeDriver.userId?.avatarUrl}
                     icon={<UserOutlined />}
                     size={48}
                     className="border-2 border-white shadow-md"
                  />
                  <div className="flex-1">
                     <p className="font-semibold text-gray-800">
                        {activeDriver.userId?.name || "Tài xế"}
                     </p>
                     <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                           <StarFilled className="text-yellow-500 text-xs" />
                           <span className="text-sm font-medium text-gray-700">
                              {activeDriver.rating || "N/A"}
                           </span>
                           <span className="text-gray-400 text-xs">•</span>
                           <span className="text-sm text-gray-600">
                              {activeDriver.totalTrips || 0} chuyến
                           </span>
                        </div>
                        <div className="flex items-center space-x-1">
                           <PhoneOutlined className="text-blue-500 text-xs" />
                           <span className="text-sm text-gray-600">
                              {activeDriver.userId?.phone || "N/A"}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 mb-4 border border-yellow-200">
               <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                     <ClockCircleOutlined className="text-yellow-600 text-xl animate-pulse" />
                  </div>
                  <div>
                     <p className="font-medium text-gray-800">Đang tìm tài xế phù hợp</p>
                     <p className="text-xs text-gray-600 mt-1">Thời gian chờ dự kiến: 5-10 phút</p>
                  </div>
               </div>
            </div>
         )}

         {/* Actions */}
         <div className="flex items-center justify-end pt-3 border-t border-gray-200">
            <Button
               type="primary"
               icon={<EyeOutlined />}
               onClick={() => onViewDetail(order._id, activeDriver)}
               className="bg-blue-600 hover:bg-blue-700"
            >
               Xem chi tiết
            </Button>
         </div>
      </Card>
   );
}
