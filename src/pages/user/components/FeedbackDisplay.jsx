import React from "react";
import { Card, Rate, Avatar, Tag, Image, Row, Col, Statistic, Empty } from "antd";
import {
   StarFilled,
   UserOutlined,
   CalendarOutlined,
   LikeOutlined,
   MessageOutlined
} from "@ant-design/icons";
import { formatDate } from "../../../utils/formatters";

const FeedbackDisplay = ({
   feedbacks = [],
   stats = null,
   showStats = true,
   loading = false
}) => {
   const getStatusColor = (status) => {
      const colors = {
         'Pending': 'orange',
         'Approved': 'green',
         'Rejected': 'red'
      };
      return colors[status] || 'default';
   };

   const getStatusText = (status) => {
      const texts = {
         'Pending': 'Chờ duyệt',
         'Approved': 'Đã duyệt',
         'Rejected': 'Từ chối'
      };
      return texts[status] || status;
   };

   if (loading) {
      return (
         <div className="space-y-4">
            {[1, 2, 3].map(i => (
               <Card key={i} loading className="h-32" />
            ))}
         </div>
      );
   }

   if (feedbacks.length === 0) {
      return (
         <Empty
            description="Chưa có đánh giá nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
         />
      );
   }

   return (
      <div className="space-y-6">
         {/* Thống kê đánh giá */}
         {showStats && stats && (
            <Card title="Thống kê đánh giá" className="mb-6">
               <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                     <Statistic
                        title="Tổng đánh giá"
                        value={stats.total || 0}
                        prefix={<StarFilled />}
                        valueStyle={{ color: '#1890ff' }}
                     />
                  </Col>
                  <Col xs={12} sm={6}>
                     <Statistic
                        title="Đánh giá TB"
                        value={stats.avgOverall || 0}
                        precision={1}
                        suffix="/ 5"
                        prefix={<StarFilled />}
                        valueStyle={{ color: '#52c41a' }}
                     />
                  </Col>
                  <Col xs={12} sm={6}>
                     <Statistic
                        title="Dịch vụ TB"
                        value={stats.avgService || 0}
                        precision={1}
                        suffix="/ 5"
                        valueStyle={{ color: '#722ed1' }}
                     />
                  </Col>
                  <Col xs={12} sm={6}>
                     <Statistic
                        title="Tài xế TB"
                        value={stats.avgDriver || 0}
                        precision={1}
                        suffix="/ 5"
                        valueStyle={{ color: '#fa8c16' }}
                     />
                  </Col>
               </Row>

               {/* Phân bố rating */}
               {stats.ratingCounts && (
                  <div className="mt-4">
                     <h5 className="mb-3">Phân bố đánh giá</h5>
                     <div className="space-y-2">
                        {stats.ratingCounts.map(({ rating, count }) => (
                           <div key={rating} className="flex items-center">
                              <span className="w-8 text-sm">{rating}★</span>
                              <div className="flex-1 mx-2">
                                 <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                       className="bg-yellow-400 h-2 rounded-full"
                                       style={{
                                          width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                                       }}
                                    />
                                 </div>
                              </div>
                              <span className="w-8 text-sm text-gray-600">{count}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </Card>
         )}

         {/* Danh sách đánh giá */}
         <div className="space-y-4">
            {feedbacks.map((feedback) => (
               <Card key={feedback._id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                     {/* Avatar */}
                     <Avatar
                        size={48}
                        src={feedback.customerId?.avatar}
                        icon={<UserOutlined />}
                        className="flex-shrink-0"
                     />

                     {/* Nội dung đánh giá */}
                     <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                 {feedback.isAnonymous ? 'Khách hàng ẩn danh' : feedback.customerId?.name || 'Khách hàng'}
                              </span>
                              <Tag color={getStatusColor(feedback.status)}>
                                 {getStatusText(feedback.status)}
                              </Tag>
                           </div>
                           <div className="flex items-center text-sm text-gray-500">
                              <CalendarOutlined className="mr-1" />
                              {formatDate(feedback.createdAt)}
                           </div>
                        </div>

                        {/* Rating tổng quan */}
                        <div className="mb-3">
                           <Rate
                              disabled
                              value={feedback.overallRating}
                              character={<StarFilled />}
                              className="text-lg"
                           />
                           <span className="ml-2 text-sm text-gray-600">
                              {feedback.overallRating}/5
                           </span>
                        </div>

                        {/* Rating chi tiết */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                           {feedback.serviceRating && (
                              <div className="flex items-center">
                                 <span className="text-gray-600 mr-1">Dịch vụ:</span>
                                 <Rate disabled value={feedback.serviceRating} size="small" />
                              </div>
                           )}
                           {feedback.driverRating && (
                              <div className="flex items-center">
                                 <span className="text-gray-600 mr-1">Tài xế:</span>
                                 <Rate disabled value={feedback.driverRating} size="small" />
                              </div>
                           )}
                           {feedback.vehicleRating && (
                              <div className="flex items-center">
                                 <span className="text-gray-600 mr-1">Xe:</span>
                                 <Rate disabled value={feedback.vehicleRating} size="small" />
                              </div>
                           )}
                           {feedback.punctualityRating && (
                              <div className="flex items-center">
                                 <span className="text-gray-600 mr-1">Đúng giờ:</span>
                                 <Rate disabled value={feedback.punctualityRating} size="small" />
                              </div>
                           )}
                        </div>

                        {/* Comment */}
                        {feedback.comment && (
                           <div className="mb-3">
                              <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                           </div>
                        )}

                        {/* Photos */}
                        {feedback.photos && feedback.photos.length > 0 && (
                           <div className="mb-3">
                              <Image.PreviewGroup>
                                 <div className="flex space-x-2">
                                    {feedback.photos.slice(0, 3).map((photo, index) => (
                                       <Image
                                          key={index}
                                          src={photo}
                                          alt={`Ảnh đánh giá ${index + 1}`}
                                          width={80}
                                          height={80}
                                          className="rounded object-cover"
                                       />
                                    ))}
                                    {feedback.photos.length > 3 && (
                                       <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                                          +{feedback.photos.length - 3}
                                       </div>
                                    )}
                                 </div>
                              </Image.PreviewGroup>
                           </div>
                        )}

                        {/* Thông tin đơn hàng */}
                        {feedback.orderId && (
                           <div className="text-xs text-gray-500 border-t pt-2">
                              <p>Đơn hàng: #{feedback.orderId._id?.slice(-8)}</p>
                              <p>
                                 {feedback.orderId.pickupAddress} → {feedback.orderId.dropoffAddress}
                              </p>
                           </div>
                        )}

                        {/* Admin response */}
                        {feedback.adminResponse && (
                           <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center mb-1">
                                 <MessageOutlined className="text-blue-500 mr-1" />
                                 <span className="text-sm font-medium text-blue-700">Phản hồi từ admin</span>
                              </div>
                              <p className="text-sm text-blue-600">{feedback.adminResponse}</p>
                           </div>
                        )}
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );
};

export default FeedbackDisplay;
