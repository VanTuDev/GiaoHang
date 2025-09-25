import React, { useState, useEffect } from 'react';
import {
   Tabs,
   Card,
   Button,
   Tag,
   Spin,
   Empty,
   Alert,
   Modal,
   Steps,
   Descriptions,
   Divider,
   message
} from 'antd';
import {
   CarOutlined,
   CheckCircleOutlined,
   ClockCircleOutlined,
   EnvironmentOutlined,
   PhoneOutlined,
   UserOutlined,
   ExclamationCircleOutlined,
   DollarOutlined
} from '@ant-design/icons';
import { orderService } from '../../features/orders/api/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { TabPane } = Tabs;
const { Step } = Steps;

export default function DriverOrders() {
   const [activeTab, setActiveTab] = useState('active');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [orders, setOrders] = useState([]);
   const [availableOrders, setAvailableOrders] = useState([]);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [detailModalVisible, setDetailModalVisible] = useState(false);
   const [updatingStatus, setUpdatingStatus] = useState(false);
   const [modal, contextHolder] = Modal.useModal();

   // Tải danh sách đơn hàng
   useEffect(() => {
      const fetchOrders = async () => {
         setLoading(true);
         setError(null);

         try {
            if (activeTab === 'available') {
               // Tải danh sách đơn hàng có sẵn để nhận
               const response = await orderService.getAvailableOrders();
               if (response.data?.success) {
                  setAvailableOrders(response.data.data || []);
               } else {
                  setError("Không thể tải danh sách đơn hàng có sẵn");
               }
            } else {
               // Tải danh sách đơn hàng của tài xế
               const status = activeTab === 'active' ? 'Accepted,PickedUp,Delivering' :
                  activeTab === 'completed' ? 'Delivered' : 'Cancelled';

               const response = await orderService.getDriverOrders({ status });
               if (response.data?.success) {
                  setOrders(response.data.data || []);
               } else {
                  setError("Không thể tải danh sách đơn hàng");
               }
            }
         } catch (error) {
            console.error("Lỗi khi tải danh sách đơn hàng:", error);
            setError("Lỗi khi tải danh sách đơn hàng: " + (error.response?.data?.message || error.message));
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, [activeTab]);

   // Xem chi tiết đơn hàng
   const handleViewDetail = async (orderId) => {
      try {
         const response = await orderService.getOrderDetail(orderId);
         if (response.data?.success) {
            setSelectedOrder(response.data.data);
            setDetailModalVisible(true);
         } else {
            message.error("Không thể tải chi tiết đơn hàng");
         }
      } catch (error) {
         console.error("Lỗi khi tải chi tiết đơn hàng:", error);
         message.error("Lỗi khi tải chi tiết đơn hàng");
      }
   };

   // Nhận đơn hàng
   const handleAcceptOrder = async (orderId, itemId) => {
      try {
         const response = await orderService.acceptItem(orderId, itemId);
         if (response.data?.success) {
            message.success("Nhận đơn hàng thành công");
            // Cập nhật lại danh sách
            setActiveTab('active');
         } else {
            message.error("Không thể nhận đơn hàng");
         }
      } catch (error) {
         console.error("Lỗi khi nhận đơn hàng:", error);
         message.error("Lỗi khi nhận đơn hàng: " + (error.response?.data?.message || error.message));
      }
   };

   // Cập nhật trạng thái đơn hàng
   const handleUpdateStatus = async (orderId, itemId, status) => {
      setUpdatingStatus(true);

      try {
         const response = await orderService.updateItemStatus(orderId, itemId, status);
         if (response.data?.success) {
            message.success(`Cập nhật trạng thái thành công: ${status}`);
            // Cập nhật lại danh sách và đóng modal
            setDetailModalVisible(false);
            setActiveTab(status === 'Delivered' ? 'completed' :
               status === 'Cancelled' ? 'cancelled' : 'active');
         } else {
            message.error("Không thể cập nhật trạng thái đơn hàng");
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
         message.error("Lỗi khi cập nhật trạng thái đơn hàng: " + (error.response?.data?.message || error.message));
      } finally {
         setUpdatingStatus(false);
      }
   };

   // Xác nhận hủy đơn hàng
   const confirmCancelOrder = (orderId, itemId) => {
      modal.confirm({
         title: 'Xác nhận hủy đơn hàng',
         icon: <ExclamationCircleOutlined />,
         content: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
         okText: 'Xác nhận',
         cancelText: 'Hủy',
         onOk: () => handleUpdateStatus(orderId, itemId, 'Cancelled')
      });
   };

   // Hiển thị trạng thái đơn hàng
   const renderOrderStatus = (status) => {
      switch (status) {
         case 'Created':
            return <Tag color="default">Chờ nhận</Tag>;
         case 'Accepted':
            return <Tag color="blue">Đã nhận</Tag>;
         case 'PickedUp':
            return <Tag color="cyan">Đã lấy hàng</Tag>;
         case 'Delivering':
            return <Tag color="processing">Đang giao</Tag>;
         case 'Delivered':
            return <Tag color="success">Đã giao</Tag>;
         case 'Cancelled':
            return <Tag color="error">Đã hủy</Tag>;
         default:
            return <Tag color="default">{status}</Tag>;
      }
   };

   // Hiển thị các bước đơn hàng
   const renderOrderSteps = (item) => {
      const { status } = item;
      let current = 0;

      switch (status) {
         case 'Accepted':
            current = 0;
            break;
         case 'PickedUp':
            current = 1;
            break;
         case 'Delivering':
            current = 2;
            break;
         case 'Delivered':
            current = 3;
            break;
         default:
            current = 0;
      }

      return (
         <Steps size="small" current={current} className="mt-4">
            <Step title="Đã nhận đơn" description={item.acceptedAt ? formatDate(item.acceptedAt, true) : ''} />
            <Step title="Đã lấy hàng" description={item.pickedUpAt ? formatDate(item.pickedUpAt, true) : ''} />
            <Step title="Đang giao" />
            <Step title="Đã giao hàng" description={item.deliveredAt ? formatDate(item.deliveredAt, true) : ''} />
         </Steps>
      );
   };

   // Hiển thị danh sách đơn hàng
   const renderOrders = () => {
      if (loading) {
         return (
            <div className="flex justify-center py-10">
               <Spin size="large" tip="Đang tải đơn hàng..." />
            </div>
         );
      }

      if (error) {
         return (
            <Alert
               message="Lỗi"
               description={error}
               type="error"
               showIcon
               className="mb-4"
            />
         );
      }

      if (activeTab === 'available') {
         if (availableOrders.length === 0) {
            return (
               <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có đơn hàng nào có sẵn để nhận"
               />
            );
         }

         return (
            <div className="space-y-4">
               {availableOrders.map((order) => (
                  <Card key={order._id} className="shadow-sm">
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="flex items-center mb-2">
                              <UserOutlined className="mr-2" />
                              <span className="font-medium">{order.customerId?.name || "Khách hàng"}</span>
                           </div>
                           <div className="mb-2">
                              <div className="text-gray-600 flex items-start">
                                 <EnvironmentOutlined className="mr-2 mt-1" />
                                 <div>
                                    <div>Từ: {order.pickupAddress}</div>
                                    <div>Đến: {order.dropoffAddress}</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="mb-2">
                              <Tag color="green">Tổng: {formatCurrency(order.totalPrice)}</Tag>
                           </div>
                           <div className="mb-2">
                              {formatDate(order.createdAt, true)}
                           </div>
                        </div>
                     </div>

                     <Divider className="my-2" />

                     <div className="space-y-3">
                        {order.items.filter(item => item.status === 'Created').map((item) => (
                           <div key={item._id} className="border-t pt-3">
                              <div className="flex justify-between items-center">
                                 <div>
                                    <div className="font-medium">{item.vehicleType}</div>
                                    <div className="text-sm text-gray-600">
                                       {item.weightKg.toLocaleString()} kg • {item.distanceKm} km
                                    </div>
                                    <div className="text-sm text-gray-600">
                                       {formatCurrency(item.priceBreakdown.total)}
                                    </div>
                                 </div>
                                 <Button
                                    type="primary"
                                    className="bg-blue-600"
                                    onClick={() => handleAcceptOrder(order._id, item._id)}
                                 >
                                    Nhận đơn
                                 </Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               ))}
            </div>
         );
      }

      if (orders.length === 0) {
         return (
            <Empty
               image={Empty.PRESENTED_IMAGE_SIMPLE}
               description={`Không có đơn hàng nào ${activeTab === 'active' ? 'đang hoạt động' :
                  activeTab === 'completed' ? 'đã hoàn thành' : 'đã hủy'
                  }`}
            />
         );
      }

      return (
         <div className="space-y-4">
            {orders.map((order) => {
               // Lọc các items theo trạng thái phù hợp với tab
               const filteredItems = order.items.filter(item => {
                  if (activeTab === 'active') {
                     return ['Accepted', 'PickedUp', 'Delivering'].includes(item.status);
                  } else if (activeTab === 'completed') {
                     return item.status === 'Delivered';
                  } else {
                     return item.status === 'Cancelled';
                  }
               });

               if (filteredItems.length === 0) return null;

               return (
                  <Card key={order._id} className="shadow-sm">
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="flex items-center mb-2">
                              <UserOutlined className="mr-2" />
                              <span className="font-medium">{order.customerId?.name || "Khách hàng"}</span>
                           </div>
                           <div className="mb-2">
                              <div className="text-gray-600 flex items-start">
                                 <EnvironmentOutlined className="mr-2 mt-1" />
                                 <div>
                                    <div>Từ: {order.pickupAddress}</div>
                                    <div>Đến: {order.dropoffAddress}</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="mb-2">
                              <Tag color="green">Tổng: {formatCurrency(order.totalPrice)}</Tag>
                           </div>
                           <div className="mb-2">
                              {formatDate(order.createdAt, true)}
                           </div>
                        </div>
                     </div>

                     <Divider className="my-2" />

                     <div className="space-y-3">
                        {filteredItems.map((item) => (
                           <div key={item._id} className="border-t pt-3">
                              <div className="flex justify-between items-center">
                                 <div>
                                    <div className="font-medium">{item.vehicleType}</div>
                                    <div className="text-sm text-gray-600">
                                       {item.weightKg.toLocaleString()} kg • {item.distanceKm} km
                                    </div>
                                    <div className="flex items-center mt-1">
                                       {renderOrderStatus(item.status)}
                                       <span className="text-sm text-gray-500 ml-2">
                                          {formatCurrency(item.priceBreakdown.total)}
                                       </span>
                                    </div>
                                 </div>
                                 <Button
                                    type="default"
                                    onClick={() => handleViewDetail(order._id)}
                                 >
                                    Chi tiết
                                 </Button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               );
            })}
         </div>
      );
   };

   return (
      <div>
         <h2 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h2>

         <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Đơn đang giao" key="active">
               {renderOrders()}
            </TabPane>
            <TabPane tab="Đơn có sẵn" key="available">
               {renderOrders()}
            </TabPane>
            <TabPane tab="Đã hoàn thành" key="completed">
               {renderOrders()}
            </TabPane>
            <TabPane tab="Đã hủy" key="cancelled">
               {renderOrders()}
            </TabPane>
         </Tabs>

         {/* Modal chi tiết đơn hàng */}
         <Modal
            title="Chi tiết đơn hàng"
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={null}
            width={700}
         >
            {selectedOrder && (
               <div>
                  <Descriptions title="Thông tin đơn hàng" bordered column={1}>
                     <Descriptions.Item label="Mã đơn hàng">{selectedOrder._id}</Descriptions.Item>
                     <Descriptions.Item label="Khách hàng">
                        {selectedOrder.customerId?.name || "Không có thông tin"}
                     </Descriptions.Item>
                     <Descriptions.Item label="Số điện thoại">
                        {selectedOrder.customerId?.phone || "Không có thông tin"}
                     </Descriptions.Item>
                     <Descriptions.Item label="Địa chỉ lấy hàng">{selectedOrder.pickupAddress}</Descriptions.Item>
                     <Descriptions.Item label="Địa chỉ giao hàng">{selectedOrder.dropoffAddress}</Descriptions.Item>
                     <Descriptions.Item label="Ghi chú">{selectedOrder.customerNote || "Không có ghi chú"}</Descriptions.Item>
                     <Descriptions.Item label="Thời gian tạo">{formatDate(selectedOrder.createdAt, true)}</Descriptions.Item>
                     <Descriptions.Item label="Tổng tiền">{formatCurrency(selectedOrder.totalPrice)}</Descriptions.Item>
                  </Descriptions>

                  <Divider>Chi tiết vận chuyển</Divider>

                  {selectedOrder.items.map((item) => {
                     // Chỉ hiển thị item của tài xế hiện tại
                     if (!item.driverId) return null;

                     return (
                        <Card key={item._id} className="mb-4">
                           <div className="mb-3">
                              <div className="font-medium">{item.vehicleType}</div>
                              <div className="text-sm text-gray-600">
                                 {item.weightKg.toLocaleString()} kg • {item.distanceKm} km
                              </div>
                              <div className="mt-1">
                                 {renderOrderStatus(item.status)}
                              </div>
                           </div>

                           {renderOrderSteps(item)}

                           <Divider />

                           <Descriptions column={1}>
                              <Descriptions.Item label="Dịch vụ bốc xếp">
                                 {item.loadingService ? "Có" : "Không"}
                              </Descriptions.Item>
                              <Descriptions.Item label="Bảo hiểm hàng hóa">
                                 {item.insurance ? "Có" : "Không"}
                              </Descriptions.Item>
                           </Descriptions>

                           <Divider>Chi phí</Divider>

                           <div className="space-y-2">
                              <div className="flex justify-between">
                                 <span>Cước phí ({formatCurrency(item.priceBreakdown.basePerKm)}/km × {item.distanceKm}km):</span>
                                 <span>{formatCurrency(item.priceBreakdown.distanceCost)}</span>
                              </div>
                              {item.loadingService && (
                                 <div className="flex justify-between">
                                    <span>Phí bốc xếp:</span>
                                    <span>{formatCurrency(item.priceBreakdown.loadCost)}</span>
                                 </div>
                              )}
                              {item.insurance && (
                                 <div className="flex justify-between">
                                    <span>Phí bảo hiểm:</span>
                                    <span>{formatCurrency(item.priceBreakdown.insuranceFee)}</span>
                                 </div>
                              )}
                              <div className="flex justify-between font-bold">
                                 <span>Tổng cộng:</span>
                                 <span>{formatCurrency(item.priceBreakdown.total)}</span>
                              </div>
                           </div>

                           {/* Các nút hành động dựa vào trạng thái */}
                           {item.status === 'Accepted' && (
                              <div className="flex justify-end mt-4 space-x-2">
                                 <Button
                                    danger
                                    onClick={() => confirmCancelOrder(selectedOrder._id, item._id)}
                                 >
                                    Hủy đơn
                                 </Button>
                                 <Button
                                    type="primary"
                                    className="bg-blue-600"
                                    onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'PickedUp')}
                                    loading={updatingStatus}
                                 >
                                    Đã lấy hàng
                                 </Button>
                              </div>
                           )}

                           {item.status === 'PickedUp' && (
                              <div className="flex justify-end mt-4 space-x-2">
                                 <Button
                                    danger
                                    onClick={() => confirmCancelOrder(selectedOrder._id, item._id)}
                                 >
                                    Hủy đơn
                                 </Button>
                                 <Button
                                    type="primary"
                                    className="bg-blue-600"
                                    onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'Delivering')}
                                    loading={updatingStatus}
                                 >
                                    Đang giao hàng
                                 </Button>
                              </div>
                           )}

                           {item.status === 'Delivering' && (
                              <div className="flex justify-end mt-4 space-x-2">
                                 <Button
                                    danger
                                    onClick={() => confirmCancelOrder(selectedOrder._id, item._id)}
                                 >
                                    Hủy đơn
                                 </Button>
                                 <Button
                                    type="primary"
                                    className="bg-blue-600"
                                    onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'Delivered')}
                                    loading={updatingStatus}
                                 >
                                    Đã giao hàng
                                 </Button>
                              </div>
                           )}
                        </Card>
                     );
                  })}
               </div>
            )}
         </Modal>

         {contextHolder}
      </div>
   );
}