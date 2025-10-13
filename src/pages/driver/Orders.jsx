import React, { useState, useEffect, useRef } from 'react';
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
   message,
   Row,
   Col,
   Statistic,
   Avatar,
   Space,
   Badge
} from 'antd';
import {
   CarOutlined,
   CheckCircleOutlined,
   ClockCircleOutlined,
   EnvironmentOutlined,
   PhoneOutlined,
   UserOutlined,
   ExclamationCircleOutlined,
   DollarOutlined,
   StarOutlined,
   WarningOutlined,
   EyeOutlined,
   TrophyOutlined,
   MessageOutlined
} from '@ant-design/icons';
import { orderService } from '../../features/orders/api/orderService';
import { feedbackService } from '../../features/feedback/api/feedbackService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import FeedbackDisplay from '../user/components/FeedbackDisplay';
import ReportViolationModal from '../user/components/ReportViolationModal';
import { io } from 'socket.io-client';

const { TabPane } = Tabs;
const { Step } = Steps;

export default function DriverOrders() {
   const [activeTab, setActiveTab] = useState('active');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [orders, setOrders] = useState([]);
   const [availableOrders, setAvailableOrders] = useState([]);
   const [counts, setCounts] = useState({ active: 0, available: 0, completed: 0, cancelled: 0 });
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [detailModalVisible, setDetailModalVisible] = useState(false);
   const [updatingStatus, setUpdatingStatus] = useState(false);
   const [modal, contextHolder] = Modal.useModal();
   const socketRef = useRef(null);
   const [socketConnected, setSocketConnected] = useState(false);

   // Feedback states
   const [feedbacks, setFeedbacks] = useState([]);
   const [feedbackStats, setFeedbackStats] = useState(null);
   const [feedbackLoading, setFeedbackLoading] = useState(false);
   const [reportModalVisible, setReportModalVisible] = useState(false);
   const [selectedDriverForReport, setSelectedDriverForReport] = useState(null);

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
               // Sử dụng trạng thái để lọc đơn hàng theo tab hiện tại
               const status = activeTab === 'active' ? 'Accepted,PickedUp,Delivering' :
                  activeTab === 'completed' ? 'Delivered' :
                     activeTab === 'received' ? 'Accepted' : 'Cancelled';

               const response = await orderService.getDriverOrders({ status });
               if (response.data?.success) {
                  console.log('Fetched orders:', response.data.data);
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

   // Xác định xem tài xế có thể báo cáo tài xế khác không
   // Chỉ cho phép báo cáo khi đơn hàng đã hoàn thành
   const canReportDriver = (status) => {
      return status === 'Delivered';
   };

   // Luôn tải số lượng cho các tab (nền)
   useEffect(() => {
      const fetchCounts = async () => {
         try {
            // Available
            const availRes = await orderService.getAvailableOrders({ page: 1, limit: 1 });
            const available = availRes.data?.meta?.total || (availRes.data?.data?.length || 0);

            // Active = Accepted + PickedUp + Delivering (ước lượng theo số đơn, không theo item)
            const [accRes, pickRes, delivRes] = await Promise.all([
               orderService.getDriverOrders({ status: 'Accepted', page: 1, limit: 1 }),
               orderService.getDriverOrders({ status: 'PickedUp', page: 1, limit: 1 }),
               orderService.getDriverOrders({ status: 'Delivering', page: 1, limit: 1 })
            ]);
            const active = (accRes.data?.meta?.total || 0) + (pickRes.data?.meta?.total || 0) + (delivRes.data?.meta?.total || 0);

            // Completed
            const doneRes = await orderService.getDriverOrders({ status: 'Delivered', page: 1, limit: 1 });
            const completed = doneRes.data?.meta?.total || 0;

            // Cancelled
            const cancelRes = await orderService.getDriverOrders({ status: 'Cancelled', page: 1, limit: 1 });
            const cancelled = cancelRes.data?.meta?.total || 0;

            setCounts({ active, available, completed, cancelled });
         } catch (e) {
            // im lặng để không làm phiền UI
         }
      };

      fetchCounts();
   }, []);

   // Kết nối Socket.IO để nhận đơn mới realtime
   useEffect(() => {
      // Tránh kết nối nhiều lần
      if (socketRef.current) return;

      const SOCKET_URL = 'http://localhost:8080';
      const socket = io(SOCKET_URL, { transports: ['websocket'], withCredentials: false });
      socketRef.current = socket;

      socket.on('connect', () => {
         setSocketConnected(true);
         // Join room cho tài xế
         socket.emit('driver:join', 'me');
      });

      socket.on('disconnect', () => {
         setSocketConnected(false);
      });

      socket.on('order:available:new', (payload) => {
         // Thông báo và cập nhật danh sách đơn có sẵn
         message.info({
            content: 'Có đơn hàng mới! Vào tab "Đơn có sẵn" để nhận.',
            duration: 3
         });

         // Chỉ thêm khung đơn mới tối thiểu (id, địa chỉ, tổng tiền) nếu đang ở tab available thì refetch
         setAvailableOrders((prev) => prev);
         // Nếu đang ở tab khác, tăng badge bằng cách kích hoạt refetch khi chuyển tab
         // Không refetch tức thời để tránh spam API; người dùng chuyển tab sẽ tải mới
         setCounts((c) => ({ ...c, available: (c.available || 0) + 1 }));
      });

      return () => {
         try { socket.disconnect(); } catch { }
         socketRef.current = null;
      };
   }, []);

   // Xem chi tiết đơn hàng
   const handleViewDetail = async (orderId) => {
      try {
         const response = await orderService.getOrderDetail(orderId);
         if (response.data?.success) {
            setSelectedOrder(response.data.data);
            setDetailModalVisible(true);

            // Load feedback cho ĐƠN HÀNG này (không phải driver)
            await loadOrderFeedbacks(orderId);
         } else {
            message.error("Không thể tải chi tiết đơn hàng");
         }
      } catch (error) {
         console.error("Lỗi khi tải chi tiết đơn hàng:", error);
         message.error("Lỗi khi tải chi tiết đơn hàng");
      }
   };

   // Load feedback của đơn hàng
   const loadOrderFeedbacks = async (orderId) => {
      setFeedbackLoading(true);
      try {
         const response = await feedbackService.getOrderFeedbacks(orderId);
         if (response.data?.success) {
            setFeedbacks(response.data.data || []);
            setFeedbackStats(response.data.stats);
         }
      } catch (error) {
         console.error("Lỗi khi tải feedback:", error);
      } finally {
         setFeedbackLoading(false);
      }
   };

   // Mở modal báo cáo
   const handleReportDriver = (driverId) => {
      setSelectedDriverForReport(driverId);
      setReportModalVisible(true);
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
      console.log('Rendering orders for tab:', activeTab);
      console.log('Orders:', orders);

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
                  <Card key={order._id} className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-green-500">
                     <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                              <Avatar icon={<UserOutlined />} className="bg-blue-100" />
                              <div>
                                 <h3 className="font-semibold text-lg">{order.customerId?.name || "Khách hàng"}</h3>
                                 <p className="text-sm text-gray-500">{formatDate(order.createdAt, true)}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                 {formatCurrency(order.totalPrice)}
                              </div>
                              <Tag color="green" className="text-sm">Đơn hàng mới</Tag>
                           </div>
                        </div>

                        {/* Address */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                           <Row gutter={[16, 8]}>
                              <Col span={12}>
                                 <div className="flex items-start">
                                    <EnvironmentOutlined className="text-green-500 mr-2 mt-1" />
                                    <div>
                                       <p className="font-medium text-green-700">Điểm lấy hàng</p>
                                       <p className="text-sm">{order.pickupAddress}</p>
                                    </div>
                                 </div>
                              </Col>
                              <Col span={12}>
                                 <div className="flex items-start">
                                    <EnvironmentOutlined className="text-red-500 mr-2 mt-1" />
                                    <div>
                                       <p className="font-medium text-red-700">Điểm giao hàng</p>
                                       <p className="text-sm">{order.dropoffAddress}</p>
                                    </div>
                                 </div>
                              </Col>
                           </Row>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                           {order.items.filter(item => item.status === 'Created').map((item) => (
                              <div key={item._id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                 <Row gutter={[16, 8]} align="middle">
                                    <Col xs={24} sm={16}>
                                       <div className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                             <CarOutlined className="text-blue-500" />
                                             <span className="font-semibold text-lg">{item.vehicleType}</span>
                                          </div>
                                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                                             <span>📦 {item.weightKg.toLocaleString()} kg</span>
                                             <span>📏 {item.distanceKm} km</span>
                                             <span>💰 {formatCurrency(item.priceBreakdown.total)}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                             {item.loadingService && <Tag color="orange">Bốc xếp</Tag>}
                                             {item.insurance && <Tag color="blue">Bảo hiểm</Tag>}
                                          </div>
                                       </div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                       <Button
                                          type="primary"
                                          size="large"
                                          className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                                          onClick={() => handleAcceptOrder(order._id, item._id)}
                                          icon={<CheckCircleOutlined />}
                                       >
                                          Nhận đơn ngay
                                       </Button>
                                    </Col>
                                 </Row>
                              </div>
                           ))}
                        </div>
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
                  activeTab === 'completed' ? 'đã hoàn thành' :
                     activeTab === 'received' ? 'đã nhận' : 'đã hủy'
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
                  } else if (activeTab === 'received') {
                     return item.status === 'Accepted';
                  } else {
                     return item.status === 'Cancelled';
                  }
               });

               if (filteredItems.length === 0) return null;

               const getBorderColor = () => {
                  if (activeTab === 'active') return 'border-l-blue-500';
                  if (activeTab === 'completed') return 'border-l-green-500';
                  if (activeTab === 'received') return 'border-l-yellow-500';
                  return 'border-l-red-500';
               };

               const getStatusIcon = () => {
                  if (activeTab === 'active') return <ClockCircleOutlined className="text-blue-500" />;
                  if (activeTab === 'completed') return <CheckCircleOutlined className="text-green-500" />;
                  if (activeTab === 'received') return <UserOutlined className="text-yellow-500" />;
                  return <ExclamationCircleOutlined className="text-red-500" />;
               };

               return (
                  <Card key={order._id} className={`shadow-lg hover:shadow-xl transition-shadow border-l-4 ${getBorderColor()}`}>
                     <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                              <Avatar icon={<UserOutlined />} className="bg-blue-100" />
                              <div>
                                 <h3 className="font-semibold text-lg">{order.customerId?.name || "Khách hàng"}</h3>
                                 <p className="text-sm text-gray-500">{formatDate(order.createdAt, true)}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                 {formatCurrency(order.totalPrice)}
                              </div>
                              <div className="flex items-center space-x-2">
                                 {getStatusIcon()}
                                 <Tag color={activeTab === 'active' ? 'blue' : activeTab === 'completed' ? 'green' :
                                    activeTab === 'received' ? 'yellow' : 'red'}>
                                    {activeTab === 'active' ? 'Đang giao' : activeTab === 'completed' ? 'Hoàn thành' :
                                       activeTab === 'received' ? 'Đã nhận' : 'Đã hủy'}
                                 </Tag>
                              </div>
                           </div>
                        </div>

                        {/* Address */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                           <Row gutter={[16, 8]}>
                              <Col span={12}>
                                 <div className="flex items-start">
                                    <EnvironmentOutlined className="text-green-500 mr-2 mt-1" />
                                    <div>
                                       <p className="font-medium text-green-700">Điểm lấy hàng</p>
                                       <p className="text-sm">{order.pickupAddress}</p>
                                    </div>
                                 </div>
                              </Col>
                              <Col span={12}>
                                 <div className="flex items-start">
                                    <EnvironmentOutlined className="text-red-500 mr-2 mt-1" />
                                    <div>
                                       <p className="font-medium text-red-700">Điểm giao hàng</p>
                                       <p className="text-sm">{order.dropoffAddress}</p>
                                    </div>
                                 </div>
                              </Col>
                           </Row>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                           {filteredItems.map((item) => (
                              <div key={item._id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                 <Row gutter={[16, 8]} align="middle">
                                    <Col xs={24} sm={16}>
                                       <div className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                             <CarOutlined className="text-blue-500" />
                                             <span className="font-semibold text-lg">{item.vehicleType}</span>
                                             {renderOrderStatus(item.status)}
                                          </div>
                                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                                             <span>📦 {item.weightKg.toLocaleString()} kg</span>
                                             <span>📏 {item.distanceKm} km</span>
                                             <span>💰 {formatCurrency(item.priceBreakdown.total)}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                             {item.loadingService && <Tag color="orange">Bốc xếp</Tag>}
                                             {item.insurance && <Tag color="blue">Bảo hiểm</Tag>}
                                          </div>
                                       </div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                       <Space direction="vertical" className="w-full">
                                          <Button
                                             type="primary"
                                             size="large"
                                             className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600"
                                             onClick={() => handleViewDetail(order._id)}
                                             icon={<EyeOutlined />}
                                          >
                                             Xem chi tiết
                                          </Button>
                                          {/* Tài xế không thể báo cáo chính mình - đã xóa nút */}
                                       </Space>
                                    </Col>
                                 </Row>
                              </div>
                           ))}
                        </div>
                     </div>
                  </Card>
               );
            })}
         </div>
      );
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold mb-2">Quản lý đơn hàng</h1>
                  <p className="text-blue-100">Theo dõi và quản lý các đơn hàng của bạn</p>
               </div>
               <div className="text-right">
                  <div className="text-4xl font-bold">{orders.length + availableOrders.length}</div>
                  <p className="text-blue-100">Tổng đơn hàng</p>
               </div>
            </div>
         </div>

         {/* Stats Cards */}
         <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đơn đang giao"
                     value={orders.filter(order => order.items.some(item => ['Accepted', 'PickedUp', 'Delivering'].includes(item.status))).length}
                     valueStyle={{ color: '#1890ff' }}
                     prefix={<CarOutlined />}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đơn có sẵn"
                     value={availableOrders.length}
                     valueStyle={{ color: '#52c41a' }}
                     prefix={<ClockCircleOutlined />}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đã hoàn thành"
                     value={orders.filter(order => order.items.some(item => item.status === 'Delivered')).length}
                     valueStyle={{ color: '#52c41a' }}
                     prefix={<CheckCircleOutlined />}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đã hủy"
                     value={orders.filter(order => order.items.some(item => item.status === 'Cancelled')).length}
                     valueStyle={{ color: '#ff4d4f' }}
                     prefix={<ExclamationCircleOutlined />}
                  />
               </Card>
            </Col>
         </Row>

         {/* Tabs */}
         <Card className="shadow-sm">
            <Tabs
               activeKey={activeTab}
               onChange={setActiveTab}
               size="large"
               items={[
                  {
                     key: 'active',
                     label: (
                        <span className="flex items-center space-x-2">
                           <CarOutlined />
                           <span>Đơn đang giao</span>
                           <Badge count={counts.active} />
                        </span>
                     ),
                     children: renderOrders()
                  },
                  {
                     key: 'available',
                     label: (
                        <span className="flex items-center space-x-2">
                           <ClockCircleOutlined />
                           <span>Đơn có sẵn</span>
                           <Badge count={counts.available} />
                        </span>
                     ),
                     children: renderOrders()
                  },
                  {
                     key: 'received',
                     label: (
                        <span className="flex items-center space-x-2">
                           <UserOutlined />
                           <span>Đơn đã nhận</span>
                           <Badge count={orders.filter(order => order.items.some(item => item.status === 'Accepted')).length} />
                        </span>
                     ),
                     children: renderOrders()
                  },
                  {
                     key: 'completed',
                     label: (
                        <span className="flex items-center space-x-2">
                           <CheckCircleOutlined />
                           <span>Đã hoàn thành</span>
                           <Badge count={counts.completed} />
                        </span>
                     ),
                     children: renderOrders()
                  },
                  {
                     key: 'cancelled',
                     label: (
                        <span className="flex items-center space-x-2">
                           <ExclamationCircleOutlined />
                           <span>Đã hủy</span>
                           <Badge count={counts.cancelled} />
                        </span>
                     ),
                     children: renderOrders()
                  }
               ]}
            />
         </Card>

         {/* Modal chi tiết đơn hàng */}
         <Modal
            title={
               <div className="flex items-center space-x-2">
                  <EyeOutlined className="text-blue-500" />
                  <span>Chi tiết đơn hàng</span>
               </div>
            }
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={null}
            width={900}
            className="order-detail-modal"
         >
            {selectedOrder && (
               <div className="space-y-6">
                  {/* Thông tin đơn hàng */}
                  <Card title="Thông tin đơn hàng" className="shadow-sm">
                     <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                           <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                 <UserOutlined className="text-blue-500" />
                                 <span className="font-medium">Khách hàng</span>
                              </div>
                              <p className="text-lg font-semibold">{selectedOrder.customerId?.name || "Không có thông tin"}</p>
                              <p className="text-gray-600">{selectedOrder.customerId?.phone || "Không có SĐT"}</p>
                           </div>
                        </Col>
                        <Col xs={24} sm={12}>
                           <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                 <DollarOutlined className="text-green-500" />
                                 <span className="font-medium">Tổng giá trị</span>
                              </div>
                              <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedOrder.totalPrice)}</p>
                              <p className="text-sm text-gray-500">Mã đơn: #{selectedOrder._id?.slice(-8)}</p>
                           </div>
                        </Col>
                     </Row>
                  </Card>

                  {/* Địa chỉ */}
                  <Card title="Địa chỉ giao hàng" className="shadow-sm">
                     <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                           <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="flex items-center space-x-2 mb-2">
                                 <EnvironmentOutlined className="text-green-500" />
                                 <span className="font-medium text-green-700">Điểm lấy hàng</span>
                              </div>
                              <p className="text-sm">{selectedOrder.pickupAddress}</p>
                           </div>
                        </Col>
                        <Col xs={24} sm={12}>
                           <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <div className="flex items-center space-x-2 mb-2">
                                 <EnvironmentOutlined className="text-red-500" />
                                 <span className="font-medium text-red-700">Điểm giao hàng</span>
                              </div>
                              <p className="text-sm">{selectedOrder.dropoffAddress}</p>
                           </div>
                        </Col>
                     </Row>
                  </Card>

                  {/* Chi tiết vận chuyển */}
                  <Card title="Chi tiết vận chuyển" className="shadow-sm">
                     {selectedOrder.items.map((item) => {
                        // Chỉ hiển thị item của tài xế hiện tại
                        if (!item.driverId) return null;

                        return (
                           <div key={item._id} className="space-y-4">
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                 <Row gutter={[16, 16]} align="middle">
                                    <Col xs={24} sm={16}>
                                       <div className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                             <CarOutlined className="text-blue-500" />
                                             <span className="font-semibold text-lg">{item.vehicleType}</span>
                                             {renderOrderStatus(item.status)}
                                          </div>
                                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                                             <span>📦 {item.weightKg.toLocaleString()} kg</span>
                                             <span>📏 {item.distanceKm} km</span>
                                             <span>💰 {formatCurrency(item.priceBreakdown.total)}</span>
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
                                             {formatCurrency(item.priceBreakdown.total)}
                                          </div>
                                          <p className="text-sm text-gray-500">Thu nhập dự kiến</p>
                                       </div>
                                    </Col>
                                 </Row>
                              </div>

                              {/* Progress Steps */}
                              {renderOrderSteps(item)}

                              {/* Chi phí chi tiết */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                 <h4 className="font-medium mb-3">Chi phí chi tiết</h4>
                                 <div className="space-y-2">
                                    <div className="flex justify-between">
                                       <span>Cước phí ({formatCurrency(item.priceBreakdown.basePerKm)}/km × {item.distanceKm}km):</span>
                                       <span className="font-medium">{formatCurrency(item.priceBreakdown.distanceCost)}</span>
                                    </div>
                                    {item.loadingService && (
                                       <div className="flex justify-between">
                                          <span>Phí bốc xếp:</span>
                                          <span className="font-medium">{formatCurrency(item.priceBreakdown.loadCost)}</span>
                                       </div>
                                    )}
                                    {item.insurance && (
                                       <div className="flex justify-between">
                                          <span>Phí bảo hiểm:</span>
                                          <span className="font-medium">{formatCurrency(item.priceBreakdown.insuranceFee)}</span>
                                       </div>
                                    )}
                                    <Divider />
                                    <div className="flex justify-between font-bold text-lg">
                                       <span>Tổng cộng:</span>
                                       <span className="text-blue-600">{formatCurrency(item.priceBreakdown.total)}</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Các nút hành động */}
                              {item.status === 'Accepted' && (
                                 <div className="flex justify-end space-x-2">
                                    <Button
                                       danger
                                       onClick={() => confirmCancelOrder(selectedOrder._id, item._id)}
                                    >
                                       Hủy đơn
                                    </Button>
                                    <Button
                                       type="primary"
                                       size="large"
                                       className="bg-blue-600 hover:bg-blue-700"
                                       onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'PickedUp')}
                                       loading={updatingStatus}
                                       icon={<CheckCircleOutlined />}
                                    >
                                       Đã lấy hàng
                                    </Button>
                                 </div>
                              )}

                              {item.status === 'PickedUp' && (
                                 <div className="flex justify-end space-x-2">
                                    <Button
                                       danger
                                       onClick={() => confirmCancelOrder(selectedOrder._id, item._id)}
                                    >
                                       Hủy đơn
                                    </Button>
                                    <Button
                                       type="primary"
                                       size="large"
                                       className="bg-blue-600 hover:bg-blue-700"
                                       onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'Delivering')}
                                       loading={updatingStatus}
                                       icon={<CarOutlined />}
                                    >
                                       Đang giao hàng
                                    </Button>
                                 </div>
                              )}

                              {item.status === 'Delivering' && (
                                 <div className="flex justify-end space-x-2">
                                    <Button
                                       danger
                                       onClick={() => confirmCancelOrder(selectedOrder._id, item._id)}
                                    >
                                       Hủy đơn
                                    </Button>
                                    <Button
                                       type="primary"
                                       size="large"
                                       className="bg-green-600 hover:bg-green-700"
                                       onClick={() => handleUpdateStatus(selectedOrder._id, item._id, 'Delivered')}
                                       loading={updatingStatus}
                                       icon={<TrophyOutlined />}
                                    >
                                       Hoàn thành giao hàng
                                    </Button>
                                 </div>
                              )}

                              {/* Tài xế không thể báo cáo chính mình - đã xóa nút */}
                           </div>
                        );
                     })}
                  </Card>

                  {/* Feedback Section */}
                  {feedbacks.length > 0 && (
                     <Card title="📝 Đánh giá từ khách hàng cho đơn hàng này" className="shadow-sm">
                        <FeedbackDisplay
                           feedbacks={feedbacks}
                           stats={feedbackStats}
                           showStats={false}
                           loading={feedbackLoading}
                        />
                     </Card>
                  )}
               </div>
            )}
         </Modal>

         {/* Modal báo cáo tài xế */}
         <ReportViolationModal
            open={reportModalVisible}
            onClose={() => setReportModalVisible(false)}
            driver={selectedDriverForReport}
            order={selectedOrder}
            onSuccess={() => {
               message.success('Báo cáo vi phạm đã được gửi thành công!');
               setReportModalVisible(false);
            }}
         />

         {contextHolder}
      </div>
   );
}