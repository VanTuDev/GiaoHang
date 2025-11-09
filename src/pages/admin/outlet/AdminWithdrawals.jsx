import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, message, Space, Typography, Select, Statistic, Row, Col } from 'antd';
import { DollarOutlined, CheckOutlined, CloseOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { withdrawalService } from '../../../features/withdrawal/api/withdrawalService';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AdminWithdrawals() {
   const [loading, setLoading] = useState(false);
   const [withdrawals, setWithdrawals] = useState([]);
   const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
   const [actionModalVisible, setActionModalVisible] = useState(false);
   const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'complete'
   const [form] = Form.useForm();
   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
   const [filters, setFilters] = useState({ status: '' });
   const [stats, setStats] = useState(null);

   useEffect(() => {
      fetchWithdrawals();
      fetchStats();
   }, [pagination.page, filters]);

   const fetchWithdrawals = async () => {
      setLoading(true);
      try {
         const params = {
            page: pagination.page,
            limit: pagination.limit,
            ...(filters.status && { status: filters.status })
         };
         const res = await withdrawalService.adminList(params);
         if (res.data?.success) {
            setWithdrawals(res.data.data || []);
            setPagination(prev => ({
               ...prev,
               total: res.data.pagination?.total || 0
            }));
         }
      } catch (error) {
         message.error('Lỗi lấy danh sách yêu cầu rút tiền');
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   const fetchStats = async () => {
      try {
         const res = await withdrawalService.adminStats();
         if (res.data?.success) {
            setStats(res.data.data);
         }
      } catch (error) {
         console.error('Lỗi lấy thống kê:', error);
      }
   };

   const handleApprove = (record) => {
      setSelectedWithdrawal(record);
      setActionType('approve');
      form.setFieldsValue({ adminNote: '' });
      setActionModalVisible(true);
   };

   const handleReject = (record) => {
      setSelectedWithdrawal(record);
      setActionType('reject');
      form.setFieldsValue({ rejectionReason: '', adminNote: '' });
      setActionModalVisible(true);
   };

   const handleComplete = (record) => {
      setSelectedWithdrawal(record);
      setActionType('complete');
      form.setFieldsValue({ adminNote: '' });
      setActionModalVisible(true);
   };

   const handleActionSubmit = async (values) => {
      if (!selectedWithdrawal) return;

      try {
         let res;
         if (actionType === 'approve') {
            res = await withdrawalService.adminApprove(selectedWithdrawal._id, {
               adminNote: values.adminNote
            });
         } else if (actionType === 'reject') {
            res = await withdrawalService.adminReject(selectedWithdrawal._id, {
               rejectionReason: values.rejectionReason,
               adminNote: values.adminNote
            });
         } else if (actionType === 'complete') {
            res = await withdrawalService.adminComplete(selectedWithdrawal._id, {
               adminNote: values.adminNote
            });
         }

         if (res?.data?.success) {
            message.success(
               actionType === 'approve' ? 'Đã chấp thuận yêu cầu rút tiền' :
               actionType === 'reject' ? 'Đã từ chối yêu cầu rút tiền' :
               'Đã đánh dấu hoàn thành chuyển tiền'
            );
            setActionModalVisible(false);
            form.resetFields();
            fetchWithdrawals();
            fetchStats();
         } else {
            message.error(res?.data?.message || 'Lỗi xử lý yêu cầu');
         }
      } catch (error) {
         message.error(error.response?.data?.message || 'Lỗi xử lý yêu cầu');
         console.error(error);
      }
   };

   const getStatusTag = (status) => {
      const statusMap = {
         Pending: { color: 'orange', text: 'Chờ xử lý' },
         Approved: { color: 'blue', text: 'Đã chấp thuận' },
         Rejected: { color: 'red', text: 'Đã từ chối' },
         Completed: { color: 'green', text: 'Hoàn thành' },
         Cancelled: { color: 'default', text: 'Đã hủy' }
      };
      const statusInfo = statusMap[status] || { color: 'default', text: status };
      return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
   };

   const columns = [
      {
         title: 'Tài xế',
         key: 'driver',
         render: (_, record) => {
            const driver = record.driverId;
            const user = driver?.userId || record.userId;
            return user ? `${user.name || ''} (${user.phone || ''})` : '-';
         }
      },
      {
         title: 'Số tiền yêu cầu',
         dataIndex: 'requestedAmount',
         key: 'requestedAmount',
         render: (amount) => `${amount?.toLocaleString('vi-VN')} VND`,
         sorter: (a, b) => (a.requestedAmount || 0) - (b.requestedAmount || 0)
      },
      {
         title: 'Số tiền thực nhận',
         dataIndex: 'actualAmount',
         key: 'actualAmount',
         render: (amount) => amount ? `${amount.toLocaleString('vi-VN')} VND` : '-'
      },
      {
         title: 'Phí hệ thống (20%)',
         dataIndex: 'systemFee',
         key: 'systemFee',
         render: (fee) => fee ? `${fee.toLocaleString('vi-VN')} VND` : '-'
      },
      {
         title: 'Thông tin ngân hàng',
         key: 'bank',
         render: (_, record) => (
            <div>
               <div><Text strong>{record.bankAccountName}</Text></div>
               <div><Text type="secondary">{record.bankName} - {record.bankAccountNumber}</Text></div>
            </div>
         )
      },
      {
         title: 'Trạng thái',
         dataIndex: 'status',
         key: 'status',
         render: (status) => getStatusTag(status),
         filters: [
            { text: 'Chờ xử lý', value: 'Pending' },
            { text: 'Đã chấp thuận', value: 'Approved' },
            { text: 'Đã từ chối', value: 'Rejected' },
            { text: 'Hoàn thành', value: 'Completed' },
            { text: 'Đã hủy', value: 'Cancelled' }
         ],
         onFilter: (value, record) => record.status === value
      },
      {
         title: 'Ngày tạo',
         dataIndex: 'createdAt',
         key: 'createdAt',
         render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-',
         sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      },
      {
         title: 'Thao tác',
         key: 'action',
         fixed: 'right',
         width: 200,
         render: (_, record) => {
            if (record.status === 'Pending') {
               return (
                  <Space>
                     <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleApprove(record)}
                     >
                        Chấp thuận
                     </Button>
                     <Button
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleReject(record)}
                     >
                        Từ chối
                     </Button>
                  </Space>
               );
            } else if (record.status === 'Approved') {
               return (
                  <Button
                     type="primary"
                     size="small"
                     icon={<CheckCircleOutlined />}
                     onClick={() => handleComplete(record)}
                  >
                     Hoàn thành
                  </Button>
               );
            }
            return '-';
         }
      }
   ];

   return (
      <div className="p-4">
         <Title level={2}>
            <DollarOutlined /> Chuyển tiền cho tài xế
         </Title>

         {/* Thống kê */}
         {stats && (
            <Row gutter={16} className="mb-4">
               <Col span={6}>
                  <Card>
                     <Statistic
                        title="Tổng yêu cầu"
                        value={stats.totals?.totalRequests || 0}
                        prefix={<DollarOutlined />}
                     />
                  </Card>
               </Col>
               <Col span={6}>
                  <Card>
                     <Statistic
                        title="Tổng số tiền yêu cầu"
                        value={stats.totals?.totalRequestedAmount || 0}
                        suffix="VND"
                        precision={0}
                     />
                  </Card>
               </Col>
               <Col span={6}>
                  <Card>
                     <Statistic
                        title="Tổng số tiền thực nhận"
                        value={stats.totals?.totalActualAmount || 0}
                        suffix="VND"
                        precision={0}
                     />
                  </Card>
               </Col>
               <Col span={6}>
                  <Card>
                     <Statistic
                        title="Tổng phí hệ thống"
                        value={stats.totals?.totalSystemFee || 0}
                        suffix="VND"
                        precision={0}
                        valueStyle={{ color: '#3f8600' }}
                     />
                  </Card>
               </Col>
            </Row>
         )}

         {/* Bộ lọc */}
         <Card className="mb-4">
            <Space>
               <Text strong>Lọc theo trạng thái: </Text>
               <Select
                  style={{ width: 200 }}
                  placeholder="Tất cả"
                  value={filters.status}
                  onChange={(value) => {
                     setFilters({ status: value });
                     setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  allowClear
               >
                  <Select.Option value="Pending">Chờ xử lý</Select.Option>
                  <Select.Option value="Approved">Đã chấp thuận</Select.Option>
                  <Select.Option value="Rejected">Đã từ chối</Select.Option>
                  <Select.Option value="Completed">Hoàn thành</Select.Option>
                  <Select.Option value="Cancelled">Đã hủy</Select.Option>
               </Select>
            </Space>
         </Card>

         {/* Bảng danh sách */}
         <Card>
            <Table
               columns={columns}
               dataSource={withdrawals}
               loading={loading}
               rowKey="_id"
               pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  onChange: (page) => setPagination(prev => ({ ...prev, page }))
               }}
               scroll={{ x: 1200 }}
            />
         </Card>

         {/* Modal xử lý yêu cầu */}
         <Modal
            title={
               actionType === 'approve' ? 'Chấp thuận yêu cầu rút tiền' :
               actionType === 'reject' ? 'Từ chối yêu cầu rút tiền' :
               'Đánh dấu hoàn thành chuyển tiền'
            }
            open={actionModalVisible}
            onCancel={() => {
               setActionModalVisible(false);
               form.resetFields();
            }}
            footer={null}
            width={600}
         >
            {selectedWithdrawal && (
               <div>
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                     <div>
                        <Text strong>Tài xế: </Text>
                        <Text>
                           {selectedWithdrawal.driverId?.userId?.name || selectedWithdrawal.userId?.name || '-'}
                        </Text>
                     </div>
                     <div>
                        <Text strong>Số tiền yêu cầu: </Text>
                        <Text>{selectedWithdrawal.requestedAmount?.toLocaleString('vi-VN')} VND</Text>
                     </div>
                     <div>
                        <Text strong>Số tiền thực nhận (80%): </Text>
                        <Text>{selectedWithdrawal.actualAmount?.toLocaleString('vi-VN')} VND</Text>
                     </div>
                     <div>
                        <Text strong>Phí hệ thống (20%): </Text>
                        <Text>{selectedWithdrawal.systemFee?.toLocaleString('vi-VN')} VND</Text>
                     </div>
                     <div>
                        <Text strong>Thông tin ngân hàng: </Text>
                        <div>
                           <Text>{selectedWithdrawal.bankAccountName}</Text>
                           <br />
                           <Text type="secondary">
                              {selectedWithdrawal.bankName} - {selectedWithdrawal.bankAccountNumber}
                           </Text>
                        </div>
                     </div>
                  </Space>

                  <Form
                     form={form}
                     layout="vertical"
                     onFinish={handleActionSubmit}
                     className="mt-4"
                  >
                     {actionType === 'reject' && (
                        <Form.Item
                           label="Lý do từ chối"
                           name="rejectionReason"
                           rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
                        >
                           <TextArea rows={3} placeholder="Nhập lý do từ chối" />
                        </Form.Item>
                     )}

                     <Form.Item
                        label="Ghi chú"
                        name="adminNote"
                     >
                        <TextArea rows={3} placeholder="Ghi chú thêm (tùy chọn)" />
                     </Form.Item>

                     {actionType === 'approve' && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                           <Text type="warning">
                              <strong>Lưu ý:</strong> Khi chấp thuận, hệ thống sẽ tự động trừ số tiền từ ví của tài xế.
                           </Text>
                        </div>
                     )}

                     <Form.Item>
                        <Space>
                           <Button
                              type={actionType === 'reject' ? 'danger' : 'primary'}
                              htmlType="submit"
                              icon={
                                 actionType === 'approve' ? <CheckOutlined /> :
                                 actionType === 'reject' ? <CloseOutlined /> :
                                 <CheckCircleOutlined />
                              }
                           >
                              {actionType === 'approve' ? 'Chấp thuận' :
                               actionType === 'reject' ? 'Từ chối' :
                               'Hoàn thành'}
                           </Button>
                           <Button onClick={() => {
                              setActionModalVisible(false);
                              form.resetFields();
                           }}>
                              Hủy
                           </Button>
                        </Space>
                     </Form.Item>
                  </Form>
               </div>
            )}
         </Modal>
      </div>
   );
}

