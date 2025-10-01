import React, { useState, useEffect } from "react";
import { Card, Row, Col, Select, Button, message, Spin, Empty } from "antd";
import { StarOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { feedbackService } from "../../features/feedback/api/feedbackService";
import FeedbackDisplay from "./components/FeedbackDisplay";

const { Option } = Select;

const Feedback = () => {
   const [feedbacks, setFeedbacks] = useState([]);
   const [loading, setLoading] = useState(false);
   const [filters, setFilters] = useState({
      page: 1,
      limit: 10,
      rating: null
   });

   const fetchFeedbacks = async () => {
      setLoading(true);
      try {
         const response = await feedbackService.getMyFeedbacks(filters);
         if (response.data?.success) {
            setFeedbacks(response.data.data);
         } else {
            message.error(response.data?.message || 'Có lỗi xảy ra');
         }
      } catch (error) {
         message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải đánh giá');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchFeedbacks();
   }, [filters]);

   const handleFilterChange = (key, value) => {
      setFilters(prev => ({
         ...prev,
         [key]: value,
         page: 1 // Reset về trang đầu khi thay đổi filter
      }));
   };

   const handleRefresh = () => {
      fetchFeedbacks();
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold flex items-center">
                  <StarOutlined className="mr-2 text-yellow-500" />
                  Đánh giá của tôi
               </h1>
               <p className="text-gray-600 mt-1">
                  Xem lại tất cả đánh giá dịch vụ bạn đã thực hiện
               </p>
            </div>
            <Button
               icon={<ReloadOutlined />}
               onClick={handleRefresh}
               loading={loading}
            >
               Làm mới
            </Button>
         </div>

         {/* Filters */}
         <Card>
            <Row gutter={[16, 16]} align="middle">
               <Col xs={24} sm={12} md={8}>
                  <div className="flex items-center">
                     <FilterOutlined className="mr-2 text-gray-500" />
                     <span className="mr-2">Đánh giá:</span>
                     <Select
                        placeholder="Tất cả đánh giá"
                        value={filters.rating}
                        onChange={(value) => handleFilterChange('rating', value)}
                        style={{ width: 120 }}
                        allowClear
                     >
                        <Option value={5}>5 sao</Option>
                        <Option value={4}>4 sao</Option>
                        <Option value={3}>3 sao</Option>
                        <Option value={2}>2 sao</Option>
                        <Option value={1}>1 sao</Option>
                     </Select>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={8}>
                  <div className="text-sm text-gray-600">
                     Tổng cộng: {feedbacks.length} đánh giá
                  </div>
               </Col>
            </Row>
         </Card>

         {/* Feedback List */}
         <Card>
            {loading ? (
               <div className="flex justify-center py-12">
                  <Spin size="large" />
               </div>
            ) : feedbacks.length === 0 ? (
               <Empty
                  description="Bạn chưa có đánh giá nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
               >
                  <p className="text-gray-500">
                     Sau khi hoàn thành đơn hàng, bạn có thể đánh giá dịch vụ tại trang "Đơn hàng"
                  </p>
               </Empty>
            ) : (
               <FeedbackDisplay
                  feedbacks={feedbacks}
                  showStats={false}
                  loading={loading}
               />
            )}
         </Card>
      </div>
   );
};

export default Feedback;
