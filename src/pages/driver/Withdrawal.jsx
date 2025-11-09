import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Table, Tag, Modal, message, Space, Typography, Divider, Statistic } from 'antd';
import { DollarOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { withdrawalService } from '../../features/withdrawal/api/withdrawalService';
import { driverService } from '../../features/driver/api/driverService';

const { Title, Text } = Typography;

export default function Withdrawal() {
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [historyLoading, setHistoryLoading] = useState(false);
   const [withdrawals, setWithdrawals] = useState([]);
   const [driverInfo, setDriverInfo] = useState(null);
   const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
   const [modalVisible, setModalVisible] = useState(false);
   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

   // Lấy thông tin tài xế để hiển thị số dư
   useEffect(() => {
      fetchDriverInfo();
      fetchHistory();
   }, []);

   const fetchDriverInfo = async () => {
      try {
         const res = await driverService.getDriverInfo();
         if (res.data?.success) {
            setDriverInfo(res.data.data);
         }
      } catch (error) {
         console.error('Lỗi lấy thông tin tài xế:', error);
      }
   };

   const fetchHistory = async (page = 1) => {
      setHistoryLoading(true);
      try {
         const res = await withdrawalService.getHistory({ page, limit: pagination.limit });
         if (res.data?.success) {
            setWithdrawals(res.data.data || []);
            setPagination(prev => ({
               ...prev,
               page,
               total: res.data.pagination?.total || 0
            }));
         }
      } catch (error) {
         message.error('Lỗi lấy lịch sử rút tiền');
         console.error(error);
      } finally {
         setHistoryLoading(false);
      }
   };

   const handleSubmit = async (values) => {
      // Kiểm tra số tài khoản xác nhận
      if (values.bankAccountNumber !== values.confirmedAccountNumber) {
         message.error('Số tài khoản xác nhận không khớp. Vui lòng kiểm tra lại hoặc đến trụ sở công ty để làm việc.');
         return;
      }

      setLoading(true);
      try {
         const res = await withdrawalService.createRequest({
            requestedAmount: Number(values.requestedAmount),
            bankAccountName: values.bankAccountName,
            bankAccountNumber: values.bankAccountNumber,
            bankName: values.bankName,
            bankCode: values.bankCode || '',
            confirmedAccountNumber: values.confirmedAccountNumber,
            driverNote: values.driverNote || ''
         });

         if (res.data?.success) {
            message.success('Yêu cầu rút tiền đã được gửi thành công');
            form.resetFields();
            fetchHistory();
            fetchDriverInfo();
         } else {
            message.error(res.data?.message || 'Lỗi tạo yêu cầu rút tiền');
         }
      } catch (error) {
         message.error(error.response?.data?.message || 'Lỗi tạo yêu cầu rút tiền');
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   const handleViewDetail = async (id) => {
      try {
         const res = await withdrawalService.getDetail(id);
         if (res.data?.success) {
            setSelectedWithdrawal(res.data.data);
            setModalVisible(true);
         }
      } catch (error) {
         message.error('Lỗi lấy chi tiết yêu cầu');
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
         title: 'Số tiền yêu cầu',
         dataIndex: 'requestedAmount',
         key: 'requestedAmount',
         render: (amount) => `${amount?.toLocaleString('vi-VN')} VND`
      },
      {
         title: 'Số tiền thực nhận',
         dataIndex: 'actualAmount',
         key: 'actualAmount',
         render: (amount) => amount ? `${amount.toLocaleString('vi-VN')} VND` : '-'
      },
      {
         title: 'Phí hệ thống',
         dataIndex: 'systemFee',
         key: 'systemFee',
         render: (fee) => fee ? `${fee.toLocaleString('vi-VN')} VND` : '-'
      },
      {
         title: 'Ngân hàng',
         key: 'bank',
         render: (_, record) => `${record.bankName} - ${record.bankAccountNumber}`
      },
      {
         title: 'Trạng thái',
         dataIndex: 'status',
         key: 'status',
         render: (status) => getStatusTag(status)
      },
      {
         title: 'Ngày tạo',
         dataIndex: 'createdAt',
         key: 'createdAt',
         render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-'
      },
      {
         title: 'Thao tác',
         key: 'action',
         render: (_, record) => (
            <Button
               type="link"
               icon={<EyeOutlined />}
               onClick={() => handleViewDetail(record._id)}
            >
               Chi tiết
            </Button>
         )
      }
   ];

   return (
      <div className="p-4">
         <Title level={2}>
            <DollarOutlined /> Rút tiền
         </Title>

         {/* Thông tin số dư */}
         {driverInfo && (
            <Card className="mb-4">
               <Statistic
                  title="Số dư hiện tại"
                  value={driverInfo.incomeBalance || 0}
                  suffix="VND"
                  valueStyle={{ color: '#3f8600' }}
               />
            </Card>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Form tạo yêu cầu */}
            <Card title="Tạo yêu cầu rút tiền" className="mb-4">
               <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
               >
                  <Form.Item
                     label="Số tiền muốn rút (VND)"
                     name="requestedAmount"
                     rules={[
                        { required: true, message: 'Vui lòng nhập số tiền' }
                     ]}
                  >
                     <Input
                        type="number"
                        placeholder="Nhập số tiền"
                        prefix={<DollarOutlined />}
                     />
                  </Form.Item>

                  <Form.Item
                     label="Tên chủ tài khoản"
                     name="bankAccountName"
                     rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản' }]}
                  >
                     <Input placeholder="Ví dụ: Nguyễn Văn A" />
                  </Form.Item>

                  <Form.Item
                     label="Số tài khoản"
                     name="bankAccountNumber"
                     rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
                  >
                     <Input placeholder="Ví dụ: 1234567890" />
                  </Form.Item>

                  <Form.Item
                     label="Xác nhận số tài khoản"
                     name="confirmedAccountNumber"
                     rules={[
                        { required: true, message: 'Vui lòng xác nhận số tài khoản' },
                        ({ getFieldValue }) => ({
                           validator(_, value) {
                              if (!value || getFieldValue('bankAccountNumber') === value) {
                                 return Promise.resolve();
                              }
                              return Promise.reject(new Error('Số tài khoản xác nhận không khớp'));
                           }
                        })
                     ]}
                  >
                     <Input placeholder="Nhập lại số tài khoản để xác nhận" />
                  </Form.Item>

                  <Form.Item
                     label="Tên ngân hàng"
                     name="bankName"
                     rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
                  >
                     <Input placeholder="Ví dụ: Vietcombank, BIDV, Techcombank" />
                  </Form.Item>

                  <Form.Item
                     label="Mã ngân hàng (tùy chọn)"
                     name="bankCode"
                  >
                     <Input placeholder="Mã ngân hàng (nếu có)" />
                  </Form.Item>

                  <Form.Item
                     label="Ghi chú (tùy chọn)"
                     name="driverNote"
                  >
                     <Input.TextArea rows={3} placeholder="Ghi chú thêm (nếu có)" />
                  </Form.Item>

                  <Form.Item>
                     <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<PlusOutlined />}
                        block
                     >
                        Gửi yêu cầu rút tiền
                     </Button>
                  </Form.Item>
               </Form>
            </Card>

            {/* Lịch sử */}
            <Card title="Lịch sử yêu cầu rút tiền" className="mb-4">
               <Table
                  columns={columns}
                  dataSource={withdrawals}
                  loading={historyLoading}
                  rowKey="_id"
                  pagination={{
                     current: pagination.page,
                     pageSize: pagination.limit,
                     total: pagination.total,
                     onChange: fetchHistory
                  }}
                  scroll={{ x: 800 }}
               />
            </Card>
         </div>

         {/* Modal chi tiết */}
         <Modal
            title="Chi tiết yêu cầu rút tiền"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={[
               <Button key="close" onClick={() => setModalVisible(false)}>
                  Đóng
               </Button>
            ]}
            width={600}
         >
            {selectedWithdrawal && (
               <div>
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                     <div>
                        <Text strong>Số tiền yêu cầu: </Text>
                        <Text>{selectedWithdrawal.requestedAmount?.toLocaleString('vi-VN')} VND</Text>
                     </div>
                     <div>
                        <Text strong>Số tiền thực nhận: </Text>
                        <Text>{selectedWithdrawal.actualAmount?.toLocaleString('vi-VN')} VND</Text>
                     </div>
                     <div>
                        <Text strong>Phí hệ thống (20%): </Text>
                        <Text>{selectedWithdrawal.systemFee?.toLocaleString('vi-VN')} VND</Text>
                     </div>
                     <Divider />
                     <div>
                        <Text strong>Tên chủ tài khoản: </Text>
                        <Text>{selectedWithdrawal.bankAccountName}</Text>
                     </div>
                     <div>
                        <Text strong>Số tài khoản: </Text>
                        <Text>{selectedWithdrawal.bankAccountNumber}</Text>
                     </div>
                     <div>
                        <Text strong>Ngân hàng: </Text>
                        <Text>{selectedWithdrawal.bankName}</Text>
                     </div>
                     <Divider />
                     <div>
                        <Text strong>Trạng thái: </Text>
                        {getStatusTag(selectedWithdrawal.status)}
                     </div>
                     {selectedWithdrawal.rejectionReason && (
                        <div>
                           <Text strong>Lý do từ chối: </Text>
                           <Text type="danger">{selectedWithdrawal.rejectionReason}</Text>
                        </div>
                     )}
                     {selectedWithdrawal.driverNote && (
                        <div>
                           <Text strong>Ghi chú: </Text>
                           <Text>{selectedWithdrawal.driverNote}</Text>
                        </div>
                     )}
                     <div>
                        <Text strong>Ngày tạo: </Text>
                        <Text>{new Date(selectedWithdrawal.createdAt).toLocaleString('vi-VN')}</Text>
                     </div>
                  </Space>
               </div>
            )}
         </Modal>
      </div>
   );
}

