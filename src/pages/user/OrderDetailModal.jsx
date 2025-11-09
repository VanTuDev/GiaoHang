import React, { useState } from 'react';
import { Modal, Card, Row, Col, Button, Divider, Tag, Avatar, Steps, Space } from 'antd';
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
   CheckCircleOutlined,
   DollarOutlined
} from '@ant-design/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';
import FeedbackDisplay from './components/FeedbackDisplay';

const { Step } = Steps;

// Helper function để lấy thông tin driver
const getDriverInfo = (driverId) => {
   if (!driverId) return null;

   // Nếu driverId đã có userId (từ OrderCard hoặc backend populate đầy đủ)
   if (driverId.userId) {
      return {
         name: driverId.userId.name || "Tài xế",
         phone: driverId.userId.phone || "N/A",
         avatarUrl: driverId.userId.avatarUrl || driverId.avatarUrl,
         rating: driverId.rating || "N/A",
         totalTrips: driverId.totalTrips || 0
      };
   }

   // Nếu driverId chỉ là string ID
   if (typeof driverId === 'string') {
      return null;
   }

   // Fallback: driverId là object nhưng chưa có userId
   return {
      name: "Tài xế",
      phone: "N/A",
      avatarUrl: driverId.avatarUrl,
      rating: driverId.rating || "N/A",
      totalTrips: driverId.totalTrips || 0
   };
};

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

// Định nghĩa hàm renderOrderSteps
const renderOrderSteps = (item) => {
   const { status } = item;
   let current = 0;

   switch (status) {
      case "Accepted":
         current = 0;
         break;
      case "PickedUp":
         current = 1;
         break;
      case "Delivering":
         current = 2;
         break;
      case "Delivered":
         current = 3;
         break;
      default:
         current = 0;
   }

   return (
      <Steps size="small" current={current} className="mt-4">
         <Step title="Đã nhận đơn" description={item.acceptedAt ? formatDate(item.acceptedAt, true) : ""} />
         <Step title="Đã lấy hàng" description={item.pickedUpAt ? formatDate(item.pickedUpAt, true) : ""} />
         <Step title="Đang giao" />
         <Step title="Đã giao hàng" description={item.deliveredAt ? formatDate(item.deliveredAt, true) : ""} />
      </Steps>
   );
};

const OrderDetailModal = ({
   open,
   onClose,
   order,
   feedbacks,
   feedbackStats,
   feedbackLoading,
   onCancelOrder,
   onOpenFeedback,
   onOpenReport
}) => {
   // Payment modal states
   const [paymentModalVisible, setPaymentModalVisible] = useState(false);
   const [selectedItem, setSelectedItem] = useState(null);

   // Thông tin tài khoản admin cố định
   const ADMIN_BANK_INFO = {
      accountName: 'NGO TRUONG QUANG VU',
      accountNumber: '0934996473',
      bankName: 'Ngân hàng'
   };

   // Tạo QR code data từ thông tin tài khoản (VietQR format)
   const generateQRCodeData = (amount) => {
      const qrData = `00020101021238570010A000000727012700069704240110${ADMIN_BANK_INFO.accountNumber}0208QRIBFTTA53037045404${amount}5802VN62100510${ADMIN_BANK_INFO.accountName}6304`;
      return qrData;
   };

   // Mở modal thanh toán
   const handleOpenPayment = (item) => {
      setSelectedItem(item);
      setPaymentModalVisible(true);
   };

   return (
      <Modal
         title={
            <div className="flex items-center space-x-2">
               <EyeOutlined className="text-blue-500" />
               <span>Chi tiết đơn hàng</span>
            </div>
         }
         open={open}
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

                        {/* Thông tin tài xế - Hiển thị luôn khi có driverId */}
                        {(() => {
                           const driverInfo = getDriverInfo(item.driverId);
                           if (!driverInfo) return null;

                           return (
                              <>
                                 <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                                    <h4 className="font-medium mb-3 text-purple-700">Thông tin tài xế</h4>
                                    <Row gutter={[16, 16]} align="middle">
                                       <Col xs={24} sm={12}>
                                          <div className="flex items-center space-x-3">
                                             <Avatar
                                                src={driverInfo.avatarUrl}
                                                icon={<UserOutlined />}
                                                size={56}
                                                className="border-2 border-white shadow-md"
                                             />
                                             <div>
                                                <div className="font-semibold text-lg text-gray-800">
                                                   {driverInfo.name}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                   <StarFilled className="text-yellow-500 text-sm" />
                                                   <span className="font-medium text-gray-700">
                                                      {driverInfo.rating}
                                                   </span>
                                                   <span className="text-gray-400">•</span>
                                                   <span className="text-sm text-gray-600">
                                                      {driverInfo.totalTrips} chuyến
                                                   </span>
                                                </div>
                                             </div>
                                          </div>
                                       </Col>
                                       <Col xs={24} sm={12}>
                                          <div className="space-y-2">
                                             <div className="flex items-center space-x-2">
                                                <PhoneOutlined className="text-blue-500" />
                                                <span className="text-gray-700">{driverInfo.phone}</span>
                                             </div>
                                             <div className="flex items-center space-x-2">
                                                <TruckOutlined className="text-green-500" />
                                                <span className="text-gray-700">{item.vehicleType}</span>
                                             </div>
                                          </div>
                                       </Col>
                                    </Row>
                                 </div>

                                 {/* Progress Steps - Hiển thị sau thông tin tài xế */}
                                 {renderOrderSteps(item)}
                              </>
                           );
                        })()}

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

                        {/* Action buttons - Hiển thị QR code dựa trên paymentBy */}
                        {/* Nếu người đặt trả tiền: Hiển thị QR khi status = PickedUp */}
                        {order.paymentBy === 'sender' && item.status === 'PickedUp' && item.driverId && (
                           <div className="flex justify-center">
                              <Button
                                 type="primary"
                                 size="large"
                                 icon={<DollarOutlined />}
                                 onClick={() => handleOpenPayment(item)}
                                 className="bg-green-600 hover:bg-green-700"
                              >
                                 Thanh toán ngay (Hiện QR)
                              </Button>
                           </div>
                        )}

                        {/* Nếu người nhận trả tiền: Hiển thị QR khi status = Delivering */}
                        {order.paymentBy === 'receiver' && item.status === 'Delivering' && item.driverId && (
                           <div className="flex justify-center">
                              <Button
                                 type="primary"
                                 size="large"
                                 icon={<DollarOutlined />}
                                 onClick={() => handleOpenPayment(item)}
                                 className="bg-green-600 hover:bg-green-700"
                              >
                                 Thanh toán ngay (Hiện QR)
                              </Button>
                           </div>
                        )}

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

         {/* Modal thanh toán - hiển thị QR code cố định của admin */}
         <Modal
            title={
               <div className="flex items-center space-x-2">
                  <DollarOutlined className="text-green-500" />
                  <span>Thanh toán chuyển khoản</span>
               </div>
            }
            open={paymentModalVisible}
            onCancel={() => setPaymentModalVisible(false)}
            footer={null}
            width={520}
         >
            {selectedItem && (
               <div className="text-center space-y-4">
                  <div>
                     <div className="text-sm text-gray-600 mb-2">Số tiền cần thanh toán</div>
                     <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(selectedItem.priceBreakdown?.total || 0)}
                     </div>
                  </div>

                  <div className="flex flex-col items-center">
                     {/* QR Code cố định */}
                     <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-lg">
                        <img
                           alt="QR Code thanh toán"
                           className="rounded-lg"
                           width={280}
                           height={280}
                           src="/imgs/QRCodeBengo.png"
                           onError={(e) => {
                              // Fallback: Tạo QR code từ thông tin tài khoản nếu ảnh không load được
                              const qrData = generateQRCodeData(selectedItem.priceBreakdown?.total || 0);
                              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=280x280`;
                           }}
                        />
                     </div>

                     {/* Thông tin tài khoản */}
                     <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 w-full">
                        <div className="text-left space-y-2">
                           <div>
                              <span className="text-sm text-gray-600">Chủ tài khoản: </span>
                              <span className="font-semibold text-blue-700">{ADMIN_BANK_INFO.accountName}</span>
                           </div>
                           <div>
                              <span className="text-sm text-gray-600">Số tài khoản: </span>
                              <span className="font-semibold text-blue-700">{ADMIN_BANK_INFO.accountNumber}</span>
                           </div>
                           <div>
                              <span className="text-sm text-gray-600">Số tiền: </span>
                              <span className="font-semibold text-green-600">
                                 {formatCurrency(selectedItem.priceBreakdown?.total || 0)}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="text-xs text-gray-500 mt-2">
                        Quét QR code hoặc chuyển khoản trực tiếp đến tài khoản trên
                     </div>

                     <Space className="mt-4">
                        <Button
                           type="primary"
                           className="bg-blue-600"
                           onClick={() => setPaymentModalVisible(false)}
                           size="large"
                        >
                           Đã thanh toán
                        </Button>
                     </Space>
                  </div>
               </div>
            )}
         </Modal>
      </Modal>
   );
};

export default OrderDetailModal;
