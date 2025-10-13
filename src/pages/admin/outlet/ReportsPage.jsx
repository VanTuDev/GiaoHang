import React, { useState, useEffect } from 'react';
import {
   Card, Table, Tag, Button, Modal, Descriptions, Avatar, Image, Select, Input,
   Row, Col, Statistic, message, Space, Badge, Divider, Form, InputNumber, Radio
} from 'antd';
import {
   WarningOutlined,
   UserOutlined,
   CarOutlined,
   PhoneOutlined,
   MailOutlined,
   SearchOutlined,
   FilterOutlined,
   CheckCircleOutlined,
   CloseCircleOutlined,
   ExclamationCircleOutlined,
   EyeOutlined,
   StarFilled,
   EnvironmentOutlined,
   ClockCircleOutlined
} from '@ant-design/icons';
import { violationService } from '../../../features/violations/api/violationService';
import { formatDate } from '../../../utils/formatters';

const { TextArea } = Input;

// Cấu hình loại vi phạm
const violationTypes = {
   LatePickup: { label: 'Trễ lấy hàng', color: 'orange', icon: <ClockCircleOutlined /> },
   LateDelivery: { label: 'Trễ giao hàng', color: 'red', icon: <ClockCircleOutlined /> },
   RudeBehavior: { label: 'Thái độ không tốt', color: 'volcano', icon: <WarningOutlined /> },
   DamagedGoods: { label: 'Làm hỏng hàng', color: 'magenta', icon: <ExclamationCircleOutlined /> },
   Overcharging: { label: 'Tính phí quá cao', color: 'purple', icon: <ExclamationCircleOutlined /> },
   UnsafeDriving: { label: 'Lái xe không an toàn', color: 'red', icon: <WarningOutlined /> },
   NoShow: { label: 'Không đến đúng giờ', color: 'orange', icon: <CloseCircleOutlined /> },
   Other: { label: 'Khác', color: 'default', icon: <ExclamationCircleOutlined /> }
};

// Cấu hình độ nghiêm trọng
const severityConfig = {
   Low: { label: 'Thấp', color: 'blue' },
   Medium: { label: 'Trung bình', color: 'orange' },
   High: { label: 'Cao', color: 'red' },
   Critical: { label: 'Rất nghiêm trọng', color: 'volcano' }
};

// Cấu hình trạng thái
const statusConfig = {
   Pending: { label: 'Chờ xử lý', color: 'gold', icon: <ClockCircleOutlined /> },
   Investigating: { label: 'Đang điều tra', color: 'blue', icon: <SearchOutlined /> },
   Resolved: { label: 'Đã xử lý', color: 'green', icon: <CheckCircleOutlined /> },
   Dismissed: { label: 'Đã bác bỏ', color: 'red', icon: <CloseCircleOutlined /> }
};

export default function ReportsPage() {
   const [loading, setLoading] = useState(false);
   const [violations, setViolations] = useState([]);
   const [selectedViolation, setSelectedViolation] = useState(null);
   const [detailModalVisible, setDetailModalVisible] = useState(false);
   const [updateModalVisible, setUpdateModalVisible] = useState(false);
   const [form] = Form.useForm();

   // Filters
   const [filters, setFilters] = useState({
      status: undefined,
      violationType: undefined,
      severity: undefined,
      search: ''
   });

   // Stats
   const [stats, setStats] = useState({
      total: 0,
      pending: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0
   });

   // Pagination
   const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 10,
      total: 0
   });

   // Fetch violations
   const fetchViolations = async (page = 1) => {
      setLoading(true);
      try {
         const params = {
            page,
            limit: pagination.pageSize,
            ...filters
         };

         const response = await violationService.getAllViolations(params);

         if (response.data?.success) {
            setViolations(response.data.data || []);
            setPagination({
               ...pagination,
               current: response.data.meta?.page || 1,
               total: response.data.meta?.total || 0
            });

            // Calculate stats
            calculateStats(response.data.data || []);
         }
      } catch (error) {
         console.error('Lỗi khi tải báo cáo:', error);
         message.error('Không thể tải danh sách báo cáo');
      } finally {
         setLoading(false);
      }
   };

   // Calculate stats
   const calculateStats = (data) => {
      setStats({
         total: data.length,
         pending: data.filter(v => v.status === 'Pending').length,
         investigating: data.filter(v => v.status === 'Investigating').length,
         resolved: data.filter(v => v.status === 'Resolved').length,
         dismissed: data.filter(v => v.status === 'Dismissed').length
      });
   };

   useEffect(() => {
      fetchViolations();
   }, [filters]);

   // View detail
   const handleViewDetail = (violation) => {
      setSelectedViolation(violation);
      setDetailModalVisible(true);
   };

   // Open update modal
   const handleOpenUpdate = (violation) => {
      setSelectedViolation(violation);
      form.setFieldsValue({
         status: violation.status,
         adminNotes: violation.adminNotes || '',
         penalty: violation.penalty || 0,
         warningCount: violation.warningCount || 0
      });
      setUpdateModalVisible(true);
   };

   // Update violation status
   const handleUpdateStatus = async () => {
      try {
         const values = await form.validateFields();
         const response = await violationService.updateViolationStatus(
            selectedViolation._id,
            values
         );

         if (response.data?.success) {
            message.success('Cập nhật trạng thái thành công');
            setUpdateModalVisible(false);
            fetchViolations(pagination.current);
         } else {
            message.error('Không thể cập nhật trạng thái');
         }
      } catch (error) {
         console.error('Lỗi cập nhật:', error);
         message.error('Lỗi cập nhật trạng thái');
      }
   };

   // Table columns
   const columns = [
      {
         title: '#',
         dataIndex: '_id',
         key: 'id',
         width: 100,
         render: (id) => <span className="font-mono text-xs">#{id.substring(0, 8)}</span>
      },
      {
         title: 'Người báo cáo',
         dataIndex: 'reporterId',
         key: 'reporter',
         render: (reporter) => (
            <div className="flex items-center space-x-2">
               <Avatar size="small" icon={<UserOutlined />} />
               <div>
                  <div className="font-medium">{reporter?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{reporter?.email}</div>
               </div>
            </div>
         )
      },
      {
         title: 'Tài xế bị báo cáo',
         dataIndex: 'driverId',
         key: 'driver',
         render: (driver) => (
            <div className="flex items-center space-x-2">
               <Avatar
                  src={driver?.userId?.avatarUrl}
                  icon={<UserOutlined />}
                  size="small"
               />
               <div>
                  <div className="font-medium">{driver?.userId?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{driver?.userId?.phone}</div>
               </div>
            </div>
         )
      },
      {
         title: 'Loại vi phạm',
         dataIndex: 'violationType',
         key: 'type',
         render: (type) => {
            const config = violationTypes[type] || violationTypes.Other;
            return (
               <Tag color={config.color}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
               </Tag>
            );
         }
      },
      {
         title: 'Mức độ',
         dataIndex: 'severity',
         key: 'severity',
         render: (severity) => {
            const config = severityConfig[severity] || severityConfig.Medium;
            return <Tag color={config.color}>{config.label}</Tag>;
         }
      },
      {
         title: 'Trạng thái',
         dataIndex: 'status',
         key: 'status',
         render: (status) => {
            const config = statusConfig[status] || statusConfig.Pending;
            return (
               <Tag color={config.color}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
               </Tag>
            );
         }
      },
      {
         title: 'Ngày báo cáo',
         dataIndex: 'createdAt',
         key: 'createdAt',
         render: (date) => formatDate(date, true)
      },
      {
         title: 'Thao tác',
         key: 'actions',
         render: (_, record) => (
            <Space>
               <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
               >
                  Xem
               </Button>
               {record.status === 'Pending' || record.status === 'Investigating' ? (
                  <Button
                     size="small"
                     type="primary"
                     onClick={() => handleOpenUpdate(record)}
                  >
                     Xử lý
                  </Button>
               ) : null}
            </Space>
         )
      }
   ];

   return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-red-50 min-h-screen">
         {/* Header */}
         <div className="mb-6">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 shadow-xl">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                        <WarningOutlined className="mr-3" />
                        Quản lý báo cáo vi phạm
                     </h1>
                     <p className="text-red-100 text-lg">Xử lý các báo cáo vi phạm từ khách hàng</p>
                  </div>
                  <div className="text-right bg-white bg-opacity-20 rounded-xl p-6 backdrop-blur-sm">
                     <div className="text-5xl font-bold text-white">{violations.length}</div>
                     <p className="text-red-100 font-medium mt-1">Báo cáo</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Stats Cards */}
         <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-0 shadow-lg hover:shadow-xl transition-all" styles={{ body: { padding: 0 } }}>
                  <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6">
                     <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                           <ClockCircleOutlined className="text-white text-2xl" />
                        </div>
                     </div>
                     <div className="text-white">
                        <p className="text-sm opacity-90 mb-1">Chờ xử lý</p>
                        <p className="text-3xl font-bold">{stats.pending}</p>
                     </div>
                  </div>
               </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-0 shadow-lg hover:shadow-xl transition-all" styles={{ body: { padding: 0 } }}>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-6">
                     <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                           <SearchOutlined className="text-white text-2xl" />
                        </div>
                     </div>
                     <div className="text-white">
                        <p className="text-sm opacity-90 mb-1">Đang điều tra</p>
                        <p className="text-3xl font-bold">{stats.investigating}</p>
                     </div>
                  </div>
               </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-0 shadow-lg hover:shadow-xl transition-all" styles={{ body: { padding: 0 } }}>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6">
                     <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                           <CheckCircleOutlined className="text-white text-2xl" />
                        </div>
                     </div>
                     <div className="text-white">
                        <p className="text-sm opacity-90 mb-1">Đã xử lý</p>
                        <p className="text-3xl font-bold">{stats.resolved}</p>
                     </div>
                  </div>
               </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
               <Card className="border-0 shadow-lg hover:shadow-xl transition-all" styles={{ body: { padding: 0 } }}>
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 p-6">
                     <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                           <CloseCircleOutlined className="text-white text-2xl" />
                        </div>
                     </div>
                     <div className="text-white">
                        <p className="text-sm opacity-90 mb-1">Đã bác bỏ</p>
                        <p className="text-3xl font-bold">{stats.dismissed}</p>
                     </div>
                  </div>
               </Card>
            </Col>
         </Row>

         {/* Filters */}
         <Card className="mb-6 shadow-md">
            <Row gutter={[16, 16]}>
               <Col xs={24} md={6}>
                  <Select
                     placeholder="Lọc theo trạng thái"
                     allowClear
                     style={{ width: '100%' }}
                     onChange={(value) => setFilters({ ...filters, status: value })}
                     value={filters.status}
                  >
                     {Object.entries(statusConfig).map(([key, config]) => (
                        <Select.Option key={key} value={key}>
                           <Tag color={config.color}>{config.label}</Tag>
                        </Select.Option>
                     ))}
                  </Select>
               </Col>
               <Col xs={24} md={6}>
                  <Select
                     placeholder="Lọc theo loại vi phạm"
                     allowClear
                     style={{ width: '100%' }}
                     onChange={(value) => setFilters({ ...filters, violationType: value })}
                     value={filters.violationType}
                  >
                     {Object.entries(violationTypes).map(([key, config]) => (
                        <Select.Option key={key} value={key}>
                           {config.label}
                        </Select.Option>
                     ))}
                  </Select>
               </Col>
               <Col xs={24} md={6}>
                  <Select
                     placeholder="Lọc theo mức độ"
                     allowClear
                     style={{ width: '100%' }}
                     onChange={(value) => setFilters({ ...filters, severity: value })}
                     value={filters.severity}
                  >
                     {Object.entries(severityConfig).map(([key, config]) => (
                        <Select.Option key={key} value={key}>
                           <Tag color={config.color}>{config.label}</Tag>
                        </Select.Option>
                     ))}
                  </Select>
               </Col>
               <Col xs={24} md={6}>
                  <Input
                     placeholder="Tìm kiếm..."
                     prefix={<SearchOutlined />}
                     allowClear
                     onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                     value={filters.search}
                  />
               </Col>
            </Row>
         </Card>

         {/* Table */}
         <Card className="shadow-lg">
            <Table
               columns={columns}
               dataSource={violations}
               rowKey="_id"
               loading={loading}
               pagination={{
                  ...pagination,
                  onChange: (page) => fetchViolations(page),
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} báo cáo`
               }}
            />
         </Card>

         {/* Detail Modal */}
         <Modal
            title={
               <span className="text-xl font-bold">
                  <WarningOutlined className="mr-2 text-red-500" />
                  Chi tiết báo cáo vi phạm
               </span>
            }
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={null}
            width={900}
         >
            {selectedViolation && (
               <div className="space-y-6">
                  {/* Thông tin người báo cáo */}
                  <Card title="👤 Người báo cáo" className="shadow-sm">
                     <Descriptions bordered column={2}>
                        <Descriptions.Item label="Tên">
                           {selectedViolation.reporterId?.name || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                           {selectedViolation.reporterId?.email || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ẩn danh">
                           {selectedViolation.isAnonymous ? 'Có' : 'Không'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày báo cáo">
                           {formatDate(selectedViolation.createdAt, true)}
                        </Descriptions.Item>
                     </Descriptions>
                  </Card>

                  {/* Thông tin tài xế bị báo cáo */}
                  <Card title="🚗 Tài xế bị báo cáo" className="shadow-sm bg-red-50">
                     <div className="flex items-start space-x-4 mb-4">
                        <Avatar
                           src={selectedViolation.driverId?.userId?.avatarUrl}
                           icon={<UserOutlined />}
                           size={80}
                           className="border-4 border-white shadow-md"
                        />
                        <div className="flex-1">
                           <h3 className="text-xl font-bold text-gray-800">
                              {selectedViolation.driverId?.userId?.name || 'N/A'}
                           </h3>
                           <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                 <StarFilled className="text-yellow-500" />
                                 <span className="font-medium">{selectedViolation.driverId?.rating || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                 <CarOutlined className="text-blue-500" />
                                 <span>{selectedViolation.driverId?.totalTrips || 0} chuyến</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     <Descriptions bordered column={2}>
                        <Descriptions.Item label="Số điện thoại">
                           <PhoneOutlined className="mr-2" />
                           {selectedViolation.driverId?.userId?.phone || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                           <MailOutlined className="mr-2" />
                           {selectedViolation.driverId?.userId?.email || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                           <Tag color={selectedViolation.driverId?.status === 'Active' ? 'green' : 'red'}>
                              {selectedViolation.driverId?.status || 'N/A'}
                           </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">
                           {selectedViolation.driverId?.rating || 'N/A'} ⭐
                        </Descriptions.Item>
                     </Descriptions>
                  </Card>

                  {/* Thông tin đơn hàng */}
                  {selectedViolation.orderId && (
                     <Card title="📦 Đơn hàng liên quan" className="shadow-sm">
                        <Descriptions bordered column={1}>
                           <Descriptions.Item label="Mã đơn hàng">
                              #{selectedViolation.orderId._id?.substring(0, 8)}
                           </Descriptions.Item>
                           <Descriptions.Item label="Điểm lấy hàng">
                              <EnvironmentOutlined className="text-green-500 mr-2" />
                              {selectedViolation.orderId.pickupAddress}
                           </Descriptions.Item>
                           <Descriptions.Item label="Điểm giao hàng">
                              <EnvironmentOutlined className="text-red-500 mr-2" />
                              {selectedViolation.orderId.dropoffAddress}
                           </Descriptions.Item>
                        </Descriptions>
                     </Card>
                  )}

                  {/* Chi tiết vi phạm */}
                  <Card title="⚠️ Chi tiết vi phạm" className="shadow-sm">
                     <Descriptions bordered column={2}>
                        <Descriptions.Item label="Loại vi phạm" span={2}>
                           {violationTypes[selectedViolation.violationType]?.label || selectedViolation.violationType}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mức độ">
                           <Tag color={severityConfig[selectedViolation.severity]?.color}>
                              {severityConfig[selectedViolation.severity]?.label}
                           </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                           <Tag color={statusConfig[selectedViolation.status]?.color}>
                              {statusConfig[selectedViolation.status]?.label}
                           </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả" span={2}>
                           <div className="bg-gray-50 p-3 rounded">
                              {selectedViolation.description}
                           </div>
                        </Descriptions.Item>
                     </Descriptions>

                     {/* Photos */}
                     {selectedViolation.photos && selectedViolation.photos.length > 0 && (
                        <div className="mt-4">
                           <h4 className="font-medium mb-2">Hình ảnh chứng minh:</h4>
                           <div className="grid grid-cols-3 gap-4">
                              {selectedViolation.photos.map((photo, index) => (
                                 <Image
                                    key={index}
                                    src={photo}
                                    alt={`Evidence ${index + 1}`}
                                    className="rounded-lg"
                                 />
                              ))}
                           </div>
                        </div>
                     )}
                  </Card>

                  {/* Xử lý của Admin */}
                  {selectedViolation.adminNotes && (
                     <Card title="🛡️ Xử lý của Admin" className="shadow-sm bg-blue-50">
                        <Descriptions bordered column={2}>
                           <Descriptions.Item label="Admin xử lý">
                              {selectedViolation.adminId?.name || 'N/A'}
                           </Descriptions.Item>
                           <Descriptions.Item label="Thời gian xử lý">
                              {selectedViolation.resolvedAt ? formatDate(selectedViolation.resolvedAt, true) : 'Chưa xử lý'}
                           </Descriptions.Item>
                           <Descriptions.Item label="Phạt tiền">
                              {selectedViolation.penalty?.toLocaleString() || 0} VND
                           </Descriptions.Item>
                           <Descriptions.Item label="Số lần cảnh báo">
                              {selectedViolation.warningCount || 0}
                           </Descriptions.Item>
                           <Descriptions.Item label="Ghi chú" span={2}>
                              <div className="bg-white p-3 rounded">
                                 {selectedViolation.adminNotes}
                              </div>
                           </Descriptions.Item>
                        </Descriptions>
                     </Card>
                  )}
               </div>
            )}
         </Modal>

         {/* Update Status Modal */}
         <Modal
            title="Xử lý báo cáo vi phạm"
            open={updateModalVisible}
            onCancel={() => setUpdateModalVisible(false)}
            onOk={handleUpdateStatus}
            okText="Cập nhật"
            cancelText="Hủy"
            width={600}
         >
            <Form form={form} layout="vertical">
               <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
               >
                  <Radio.Group>
                     {Object.entries(statusConfig).map(([key, config]) => (
                        <Radio key={key} value={key}>
                           <Tag color={config.color}>{config.label}</Tag>
                        </Radio>
                     ))}
                  </Radio.Group>
               </Form.Item>

               <Form.Item
                  name="penalty"
                  label="Phạt tiền (VND)"
               >
                  <InputNumber
                     min={0}
                     step={10000}
                     style={{ width: '100%' }}
                     formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                     parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
               </Form.Item>

               <Form.Item
                  name="warningCount"
                  label="Số lần cảnh báo"
               >
                  <InputNumber min={0} max={10} style={{ width: '100%' }} />
               </Form.Item>

               <Form.Item
                  name="adminNotes"
                  label="Ghi chú xử lý"
                  rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
               >
                  <TextArea rows={4} placeholder="Nhập ghi chú về cách xử lý vi phạm này..." />
               </Form.Item>
            </Form>
         </Modal>
      </div>
   );
}
