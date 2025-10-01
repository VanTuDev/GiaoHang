"use client"

import React, { useRef, useState } from "react"
import { Modal, Image, Skeleton, Tag, Button, Divider, Card, Row, Col, Statistic, message } from "antd"
import {
   CarOutlined,
   PhoneOutlined,
   EnvironmentOutlined,
   StarFilled,
   ClockCircleOutlined,
   DollarCircleOutlined,
   InfoCircleOutlined,
   UserOutlined,
   SafetyOutlined,
   CheckCircleOutlined,
   CalendarOutlined
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

import useOnClickOutside from "../../../authentication/hooks/useOnClickOutside"
import { formatCurrency } from "../../../utils/formatters"

export default function VehicleDetailModal({ open, onClose, vehicle, loading }) {
   const contentRef = useRef(null)
   const navigate = useNavigate()
   const [bookingLoading, setBookingLoading] = useState(false)

   useOnClickOutside(contentRef, onClose)

   if (!vehicle && !loading) return null

   // Xử lý đặt xe
   const handleBookVehicle = async () => {
      setBookingLoading(true)
      try {
         // Chuyển đến trang đặt hàng với thông tin xe đã chọn
         navigate(`/dashboard/order-create?vehicleId=${vehicle._id}&type=${encodeURIComponent(vehicle.type)}&weight=${vehicle.maxWeightKg}`)
         onClose()
      } catch (error) {
         message.error("Có lỗi xảy ra khi đặt xe")
      } finally {
         setBookingLoading(false)
      }
   }

   return (
      <Modal
         open={open}
         onCancel={onClose}
         footer={null}
         title={loading ? "Đang tải thông tin xe..." : `Chi tiết xe - ${vehicle?.label || vehicle?.type}`}
         centered
         width={900}
         maskClosable={false}
         styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      >
         {loading ? (
            <div className="space-y-6">
               <Skeleton.Image active className="w-full h-80" />
               <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                     <Skeleton active paragraph={{ rows: 6 }} />
                  </Col>
                  <Col xs={24} lg={12}>
                     <Skeleton active paragraph={{ rows: 6 }} />
                  </Col>
               </Row>
            </div>
         ) : (
            <div ref={contentRef} className="space-y-6">
               {/* Header với ảnh xe */}
               <div className="relative">
                  <Image.PreviewGroup preview={{ getContainer: () => contentRef.current }}>
                     <Image
                        src={vehicle.photoUrl || "https://placehold.co/800x400?text=" + vehicle.type}
                        alt={vehicle.type}
                        className="w-full h-80 object-cover rounded-lg"
                        style={{ objectFit: 'cover' }}
                        fallback="https://placehold.co/800x400?text=No+Image"
                     />
                  </Image.PreviewGroup>
                  <div className="absolute top-4 left-4">
                     <Tag color="blue" className="text-lg px-3 py-1">
                        {vehicle.type}
                     </Tag>
                  </div>
                  <div className="absolute top-4 right-4">
                     <Tag color="green" className="text-lg px-3 py-1">
                        {vehicle.maxWeightKg?.toLocaleString() || "N/A"} kg
                     </Tag>
                  </div>
               </div>

               {/* Thông tin chính */}
               <Row gutter={[24, 24]}>
                  {/* Cột trái: Thông tin xe */}
                  <Col xs={24} lg={14}>
                     <Card title="Thông tin xe" className="h-full">
                        <div className="space-y-4">
                           <div>
                              <h3 className="text-2xl font-bold mb-2">{vehicle.type}</h3>
                              <p className="text-gray-600 text-lg">
                                 {vehicle.description || "Xe vận chuyển hàng hóa chuyên nghiệp"}
                              </p>
                           </div>

                           <Divider />

                           {/* Thống kê xe */}
                           <Row gutter={[16, 16]}>
                              <Col xs={12} sm={6}>
                                 <Statistic
                                    title="Giá/km"
                                    value={vehicle.pricePerKm || 40000}
                                    formatter={(value) => formatCurrency(value)}
                                    prefix={<DollarCircleOutlined />}
                                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                                 />
                              </Col>
                              <Col xs={12} sm={6}>
                                 <Statistic
                                    title="Tải trọng"
                                    value={vehicle.maxWeightKg || 0}
                                    suffix="kg"
                                    prefix={<CarOutlined />}
                                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                                 />
                              </Col>
                              <Col xs={12} sm={6}>
                                 <Statistic
                                    title="Trạng thái"
                                    value={vehicle.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{
                                       color: vehicle.status === 'Active' ? '#52c41a' : '#ff4d4f',
                                       fontSize: '16px'
                                    }}
                                 />
                              </Col>
                              <Col xs={12} sm={6}>
                                 <Statistic
                                    title="Biển số"
                                    value={vehicle.licensePlate || "N/A"}
                                    prefix={<SafetyOutlined />}
                                    valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                                 />
                              </Col>
                           </Row>

                           {/* Tính năng xe */}
                           <div>
                              <h4 className="font-semibold mb-3 flex items-center">
                                 <InfoCircleOutlined className="mr-2" />
                                 Tính năng xe
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                 <Tag color="blue">Vận chuyển hàng hóa</Tag>
                                 <Tag color="green">Bảo hiểm hàng hóa</Tag>
                                 <Tag color="orange">Dịch vụ bốc xếp</Tag>
                                 <Tag color="purple">Theo dõi GPS</Tag>
                              </div>
                           </div>
                        </div>
                     </Card>
                  </Col>

                  {/* Cột phải: Thông tin tài xế */}
                  <Col xs={24} lg={10}>
                     <Card title="Thông tin tài xế" className="h-full">
                        {vehicle.driverId ? (
                           <div className="space-y-4">
                              {/* Thông tin cơ bản */}
                              <div className="text-center">
                                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <UserOutlined className="text-2xl text-blue-600" />
                                 </div>
                                 <h4 className="text-xl font-semibold mb-1">
                                    {vehicle.driverId.userId?.name || "Tài xế"}
                                 </h4>
                                 <p className="text-gray-600">
                                    <PhoneOutlined className="mr-1" />
                                    {vehicle.driverId.userId?.phone || "N/A"}
                                 </p>
                              </div>

                              <Divider />

                              {/* Đánh giá */}
                              <div className="text-center">
                                 <div className="flex items-center justify-center mb-2">
                                    <StarFilled className="text-yellow-500 text-xl mr-1" />
                                    <span className="text-2xl font-bold">
                                       {vehicle.driverId.rating || "N/A"}
                                    </span>
                                 </div>
                                 <p className="text-gray-600">
                                    {vehicle.driverId.totalTrips || 0} chuyến đã hoàn thành
                                 </p>
                              </div>

                              {/* Khu vực hoạt động */}
                              {Array.isArray(vehicle.driverId?.serviceAreas) && vehicle.driverId.serviceAreas.length > 0 && (
                                 <>
                                    <Divider />
                                    <div>
                                       <h5 className="font-medium mb-2 flex items-center">
                                          <EnvironmentOutlined className="mr-2" />
                                          Khu vực hoạt động
                                       </h5>
                                       <div className="flex flex-wrap gap-1">
                                          {vehicle.driverId.serviceAreas.map((area, i) => (
                                             <Tag key={i} color="blue" className="text-xs">
                                                {area}
                                             </Tag>
                                          ))}
                                       </div>
                                    </div>
                                 </>
                              )}

                              {/* Trạng thái online */}
                              <div className="text-center">
                                 <Tag
                                    color={vehicle.driverId.isOnline ? "green" : "red"}
                                    className="text-sm px-3 py-1"
                                 >
                                    {vehicle.driverId.isOnline ? "Đang online" : "Offline"}
                                 </Tag>
                              </div>
                           </div>
                        ) : (
                           <div className="text-center text-gray-500 py-8">
                              <UserOutlined className="text-4xl mb-2" />
                              <p>Chưa có thông tin tài xế</p>
                           </div>
                        )}
                     </Card>
                  </Col>
               </Row>

               {/* Action buttons */}
               <div className="flex gap-3 justify-center">
                  <Button
                     size="large"
                     onClick={onClose}
                     className="px-8"
                  >
                     Đóng
                  </Button>
                  <Button
                     type="primary"
                     size="large"
                     loading={bookingLoading}
                     onClick={handleBookVehicle}
                     className="px-8 bg-blue-600 hover:bg-blue-700"
                     icon={<CalendarOutlined />}
                  >
                     Đặt xe này
                  </Button>
               </div>

               {/* Thông tin bổ sung */}
               <Card className="bg-blue-50 border-blue-200">
                  <div className="flex items-start">
                     <InfoCircleOutlined className="text-blue-600 mr-3 mt-1 text-lg" />
                     <div>
                        <h5 className="font-semibold text-blue-800 mb-2">Lưu ý quan trọng</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                           <li>• Giá cước được tính dựa trên khối lượng hàng hóa và quãng đường di chuyển</li>
                           <li>• Có thể phát sinh thêm phí bốc xếp hàng hóa (+50,000đ) và phí bảo hiểm (+100,000đ)</li>
                           <li>• Tài xế sẽ liên hệ với bạn trong vòng 15 phút sau khi đặt hàng</li>
                           <li>• Hỗ trợ theo dõi hành trình real-time qua ứng dụng</li>
                        </ul>
                     </div>
                  </div>
               </Card>
            </div>
         )}
      </Modal>
   )
}