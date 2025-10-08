import React from 'react';
import { Modal, Card, Row, Col, Button, Divider, Tag, Avatar } from 'antd';
import {
   EyeOutlined,
   ExclamationCircleOutlined,
   EnvironmentOutlined,
   UserOutlined,
   StarFilled,
   TruckOutlined,
   PhoneOutlined,
   StarOutlined,
   WarningOutlined,
   ClockCircleOutlined,
   ProfileOutlined,
   CheckCircleOutlined
} from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import FeedbackDisplay from './components/FeedbackDisplay';

// Định nghĩa hàm renderOrderStatus
const renderOrderStatus = (status) => {
   const statusConfig = {
      Created: { label: "Đang tìm tài xế", color: "gold", icon: <ClockCircleOutlined /> },
      Accepted: { label: "Đã có tài xế", color: "blue", icon: <UserOutlined /> },
      PickedUp: { label: "Đã lấy hàng", color: "purple", icon: <ProfileOutlined /> },
      Delivering: { label: "Đang giao", color: "orange", icon: <TruckOutlined /> },
      Delivered: { label: "Đã giao", color: "green", icon: <CheckCircleOutlined /> },
      Cancelled: { label: "Đã hủy", color: "red", icon: <ExclamationCircleOutlined /> },
   };
   const config = statusConfig[status] || { label: status, color: "default", icon: <ClockCircleOutlined /> };
   return (
      <Tag color={config.color}>
         {config.icon}
         <span style={{ marginLeft: 6 }}>{config.label}</span>
      </Tag>
   );
};

const OrderDetailModal = ({
   visible,
   onClose,
   order,
   feedbacks,
   feedbackStats,
   feedbackLoading,
   onCancelOrder,
   onOpenFeedback,
   onOpenReport
}) => {
   return (
      <Modal
         title={
            <div className="flex items-center space-x-2">
               <EyeOutlined className="text-blue-500" />
               <span>Chi tiết đơn hàng</span>
            </div>
         }
         open={visible}
         onCancel={onClose}
         footer={null}
         width={900}
         className="order-detail-modal"
      >
         {order && (
            <div className="space-y-6">
               {/* Thông tin đơn hàng */}
               <Card title="Thông tin đơn hàng" className="shadow-sm">
                  <Row gutter={[16, 16]}>
                     <Col xs={24} sm={12}>
                        <div className="space-y-2">
                           <div className="flex items-center space-x-2">
                              <UserOutlined className="text-blue-500" />
                              <span className="font-medium">Mã đơn hàng</span>
                           </div>
                           <p className="text-lg font-semibold">#{order._id?.slice(-8)}</p>
                           <p className="text-sm text-gray-500">{formatDate(order.createdAt, true)}</p>
                        </div>
                     </Col>
                     <Col xs={24} sm={12}>
                        <div className="space-y-2">
                           <div className="flex items-center space-x-2">
                              <StarFilled className="text-green-500" />
                              <span className="font-medium">Tổng giá trị</span>
                           </div>
                           <p className="text-2xl font-bold text-green-600">{formatCurrency(order.totalPrice)}</p>
                        </div>
                     </Col>
                  </Row>
               </Card>

               {/* Nút hủy đơn hàng */}
               {order.items.every(item => item.status === 'Created') && (
                  <div className="flex justify-center mt-4">
                     <Button
                        type="danger"
                        size="large"
                        icon={<ExclamationCircleOutlined />}
                        onClick={() => onCancelOrder(order._id)}
                     >
                        Hủy đơn hàng
                     </Button>
                  </div>
               )}

               {/* Địa chỉ */}
               <Card title="Địa chỉ giao hàng" className="shadow-sm">
                  <Row gutter={[16, 16]}>
                     <Col xs={24} sm={12}>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                           <div className="flex items-center space-x-2 mb-2">
                              <EnvironmentOutlined className="text-green-500" />
                              <span className="font-medium text-green-700">Điểm lấy hàng</span>
                           </div>
                           <p className="text-sm">{order.pickupAddress}</p>
                        </div>
                     </Col>
                     <Col xs={24} sm={12}>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                           <div className="flex items-center space-x-2 mb-2">
                              <EnvironmentOutlined className="text-red-500" />
                              <span className="font-medium text-red-700">Điểm giao hàng</span>
                           </div>
                           <p className="text-sm">{order.dropoffAddress}</p>
                        </div>
                     </Col>
                  </Row>
                  {order.customerNote && (
                     <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-700 mb-1">Ghi chú:</div>
                        <p className="text-sm text-blue-600">{order.customerNote}</p>
                     </div>
                  )}
               </Card>

               {/* Chi tiết vận chuyển */}
               <Card title="Chi tiết vận chuyển" className="shadow-sm">
                  {order.items.map((item, index) => (
                     <div key={index} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                           <Row gutter={[16, 16]} align="middle">
                              <Col xs={24} sm={16}>
                                 <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                       <TruckOutlined className="text-blue-500" />
                                       <span className="font-semibold text-lg">{item.vehicleType}</span>
                                       {renderOrderStatus(item.status)}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                       <span>📦 {item.weightKg.toLocaleString()} kg</span>
                                       <span>📏 {item.distanceKm} km</span>
                                       <span>💰 {formatCurrency(item.priceBreakdown?.total || 0)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       {item.loadingService && <Tag color="orange">Bốc xếp</Tag>}
                                       {item.insurance && <Tag color="blue">Bảo hiểm</Tag>}
                                    </div>
                                 </div>
                              </Col>
                              <Col xs={24} sm={8}>
                                 <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">
                                       {formatCurrency(item.priceBreakdown?.total || 0)}
                                    </div>
                                    <p className="text-sm text-gray-500">Chi phí vận chuyển</p>
                                 </div>
                              </Col>
                           </Row>
                        </div>

                        {/* Progress Steps */}
                        {item.driverId && renderOrderSteps(item)}

                        {/* Thông tin tài xế */}
                        {item.driverId && (
                           <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-3">Thông tin tài xế</h4>
                              <Row gutter={[16, 16]} align="middle">
                                 <Col xs={24} sm={12}>
                                    <div className="flex items-center space-x-3">
                                       <Avatar src={item.driverId.avatarUrl} icon={<UserOutlined />} size="large" />
                                       <div>
                                          <div className="font-semibold text-lg">{item.driverId.userId?.name || "Tài xế"}</div>
                                          <div className="flex items-center space-x-2">
                                             <StarFilled className="text-yellow-500" />
                                             <span className="font-medium">{item.driverId.rating || "N/A"}</span>
                                             <span className="text-sm text-gray-500">({item.driverId.totalTrips || 0} chuyến)</span>
                                          </div>
                                       </div>
                                    </div>
                                 </Col>
                                 <Col xs={24} sm={12}>
                                    <div className="space-y-2">
                                       <div className="flex items-center space-x-2">
                                          <PhoneOutlined className="text-blue-500" />
                                          <span>{item.driverId.userId?.phone || "N/A"}</span>
                                       </div>
                                       <div className="flex items-center space-x-2">
                                          <TruckOutlined className="text-green-500" />
                                          <span>{item.vehicleType}</span>
                                       </div>
                                    </div>
                                 </Col>
                              </Row>
                           </div>
                        )}

                        {/* Chi phí chi tiết */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                           <h4 className="font-medium mb-3">Chi phí chi tiết</h4>
                           <div className="space-y-2">
                              <div className="flex justify-between">
                                 <span>Cước phí ({formatCurrency(item.priceBreakdown?.basePerKm || 0)}/km × {item.distanceKm}km):</span>
                                 <span className="font-medium">{formatCurrency(item.priceBreakdown?.distanceCost || 0)}</span>
                              </div>
                              {item.loadingService && (
                                 <div className="flex justify-between">
                                    <span>Phí bốc xếp:</span>
                                    <span className="font-medium">{formatCurrency(item.priceBreakdown?.loadCost || 0)}</span>
                                 </div>
                              )}
                              {item.insurance && (
                                 <div className="flex justify-between">
                                    <span>Phí bảo hiểm:</span>
                                    <span className="font-medium">{formatCurrency(item.priceBreakdown?.insuranceFee || 0)}</span>
                                 </div>
                              )}
                              <Divider />
                              <div className="flex justify-between font-bold text-lg">
                                 <span>Tổng cộng:</span>
                                 <span className="text-blue-600">{formatCurrency(item.priceBreakdown?.total || 0)}</span>
                              </div>
                           </div>
                        </div>

                        {/* Action buttons cho đơn đã hoàn thành */}
                        {item.status === 'Delivered' && item.driverId && (
                           <div className="flex justify-center space-x-4">
                              <Button
                                 type="primary"
                                 size="large"
                                 icon={<StarOutlined />}
                                 onClick={() => {
                                    onClose();
                                    onOpenFeedback(order);
                                 }}
                                 className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500"
                              >
                                 Đánh giá dịch vụ
                              </Button>
                              <Button
                                 danger
                                 size="large"
                                 icon={<WarningOutlined />}
                                 onClick={() => {
                                    onClose();
                                    onOpenReport(order);
                                 }}
                              >
                                 Báo cáo tài xế
                              </Button>
                           </div>
                        )}
                     </div>
                  ))}
               </Card>

               {/* Feedback Section */}
               {feedbacks.length > 0 && (
                  <Card title="Đánh giá dịch vụ" className="shadow-sm">
                     <FeedbackDisplay
                        feedbacks={feedbacks}
                        stats={feedbackStats}
                        showStats={true}
                        loading={feedbackLoading}
                     />
                  </Card>
               )}
            </div>
         )}
      </Modal>
   );
};

export default OrderDetailModal;
