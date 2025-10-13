import React, { useState, useEffect } from "react";
import { Card, Row, Col, Select, Button, message, Spin, Empty, Tag, Timeline } from "antd";
import {
   WarningOutlined,
   FilterOutlined,
   ReloadOutlined,
   ClockCircleOutlined,
   CheckCircleOutlined,
   CloseCircleOutlined,
   ExclamationCircleOutlined
} from "@ant-design/icons";
import { violationService } from "../../features/violations/api/violationService";
import { formatDate } from "../../utils/formatters";

const { Option } = Select;

const VIOLATION_TYPE_LABELS = {
   "LatePickup": "Trễ lấy hàng",
   "LateDelivery": "Trễ giao hàng",
   "RudeBehavior": "Thái độ không tốt",
   "DamagedGoods": "Làm hỏng hàng hóa",
   "Overcharging": "Tính phí quá cao",
   "UnsafeDriving": "Lái xe không an toàn",
   "NoShow": "Không đến đúng giờ",
   "Other": "Khác"
};

const SEVERITY_COLORS = {
   "Low": "green",
   "Medium": "orange",
   "High": "red",
   "Critical": "purple"
};

const STATUS_COLORS = {
   "Pending": "orange",
   "Investigating": "blue",
   "Resolved": "green",
   "Dismissed": "red"
};

const STATUS_LABELS = {
   "Pending": "Chờ xử lý",
   "Investigating": "Đang điều tra",
   "Resolved": "Đã xử lý",
   "Dismissed": "Từ chối"
};

const Reports = () => {
   const [reports, setReports] = useState([]);
   const [loading, setLoading] = useState(false);
   const [filters, setFilters] = useState({
      page: 1,
      limit: 10,
      status: null
   });

   const fetchReports = async () => {
      setLoading(true);
      try {
         const response = await violationService.getMyReports(filters);
         if (response.data?.success) {
            setReports(response.data.data);
         } else {
            message.error(response.data?.message || 'Có lỗi xảy ra');
         }
      } catch (error) {
         message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải báo cáo');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchReports();
   }, [filters]);

   const handleFilterChange = (key, value) => {
      setFilters(prev => ({
         ...prev,
         [key]: value,
         page: 1
      }));
   };

   const handleRefresh = () => {
      fetchReports();
   };

   const getStatusIcon = (status) => {
      const icons = {
         "Pending": <ClockCircleOutlined />,
         "Investigating": <ExclamationCircleOutlined />,
         "Resolved": <CheckCircleOutlined />,
         "Dismissed": <CloseCircleOutlined />
      };
      return icons[status] || <ClockCircleOutlined />;
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold flex items-center">
                  <WarningOutlined className="mr-2 text-red-500" />
                  Báo cáo vi phạm
               </h1>
               <p className="text-gray-600 mt-1">
                  Theo dõi trạng thái các báo cáo vi phạm bạn đã gửi
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
                     <span className="mr-2">Trạng thái:</span>
                     <Select
                        placeholder="Tất cả trạng thái"
                        value={filters.status}
                        onChange={(value) => handleFilterChange('status', value)}
                        style={{ width: 150 }}
                        allowClear
                     >
                        <Option value="Pending">Chờ xử lý</Option>
                        <Option value="Investigating">Đang điều tra</Option>
                        <Option value="Resolved">Đã xử lý</Option>
                        <Option value="Dismissed">Từ chối</Option>
                     </Select>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={8}>
                  <div className="text-sm text-gray-600">
                     Tổng cộng: {reports.length} báo cáo
                  </div>
               </Col>
            </Row>
         </Card>

         {/* Reports List */}
         <Card>
            {loading ? (
               <div className="flex justify-center py-12">
                  <Spin size="large" />
               </div>
            ) : reports.length === 0 ? (
               <Empty
                  description="Bạn chưa có báo cáo vi phạm nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
               >
                  <p className="text-gray-500">
                     Nếu gặp vấn đề với tài xế, bạn có thể báo cáo tại trang "Đơn hàng"
                  </p>
               </Empty>
            ) : (
               <div className="space-y-4">
                  {reports.map((report) => (
                     <Card key={report._id} className="hover:shadow-md transition-shadow">
                        <div className="space-y-4">
                           {/* Header */}
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                 <Tag
                                    color={STATUS_COLORS[report.status]}
                                    icon={getStatusIcon(report.status)}
                                    className="text-sm"
                                 >
                                    {STATUS_LABELS[report.status]}
                                 </Tag>
                                 <Tag color={SEVERITY_COLORS[report.severity]}>
                                    {report.severity}
                                 </Tag>
                                 <span className="text-sm text-gray-500">
                                    {formatDate(report.createdAt)}
                                 </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                 #{report._id?.slice(-8)}
                              </div>
                           </div>

                           {/* Content */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <h4 className="font-medium mb-2">Thông tin báo cáo</h4>
                                 <div className="space-y-2 text-sm">
                                    <div>
                                       <span className="text-gray-600">Loại vi phạm:</span>
                                       <span className="ml-2 font-medium">
                                          {VIOLATION_TYPE_LABELS[report.violationType]}
                                       </span>
                                    </div>
                                    <div>
                                       <span className="text-gray-600">Tài xế:</span>
                                       <span className="ml-2 font-medium">
                                          {report.driverId?.userId?.name || 'N/A'}
                                       </span>
                                    </div>
                                    {report.orderId && (
                                       <div>
                                          <span className="text-gray-600">Đơn hàng:</span>
                                          <span className="ml-2 font-medium">
                                             #{report.orderId._id?.slice(-8)}
                                          </span>
                                       </div>
                                    )}
                                 </div>
                              </div>

                              <div>
                                 <h4 className="font-medium mb-2">Mô tả</h4>
                                 <p className="text-sm text-gray-700 leading-relaxed">
                                    {report.description}
                                 </p>
                              </div>
                           </div>

                           {/* Photos */}
                           {report.photos && report.photos.length > 0 && (
                              <div>
                                 <h4 className="font-medium mb-2">Ảnh chứng minh</h4>
                                 <div className="flex space-x-2">
                                    {report.photos.slice(0, 3).map((photo, index) => (
                                       <img
                                          key={index}
                                          src={photo}
                                          alt={`Chứng minh ${index + 1}`}
                                          className="w-20 h-20 object-cover rounded border"
                                       />
                                    ))}
                                    {report.photos.length > 3 && (
                                       <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                                          +{report.photos.length - 3}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}

                           {/* Admin Response */}
                           {report.adminNotes && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                 <h4 className="font-medium text-blue-800 mb-2">
                                    Phản hồi từ admin
                                 </h4>
                                 <p className="text-sm text-blue-700">
                                    {report.adminNotes}
                                 </p>
                                 {report.adminId && (
                                    <p className="text-xs text-blue-600 mt-2">
                                       Xử lý bởi: {report.adminId.name} - {formatDate(report.resolvedAt)}
                                    </p>
                                 )}
                              </div>
                           )}

                           {/* Penalty Info */}
                           {report.penalty > 0 && (
                              <div className="bg-red-50 p-4 rounded-lg">
                                 <h4 className="font-medium text-red-800 mb-2">
                                    Hình phạt
                                 </h4>
                                 <p className="text-sm text-red-700">
                                    Phạt tiền: {report.penalty.toLocaleString()}đ
                                 </p>
                                 {report.warningCount > 0 && (
                                    <p className="text-sm text-red-700">
                                       Cảnh báo: {report.warningCount} lần
                                    </p>
                                 )}
                              </div>
                           )}
                        </div>
                     </Card>
                  ))}
               </div>
            )}
         </Card>
      </div>
   );
};

export default Reports;
