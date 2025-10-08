import React, { useState, useEffect } from "react";
import {
   Row,
   Col,
   Card,
   Input,
   Select,
   Tag,
   Avatar,
   Button,
   Statistic,
   Space,
   Spin,
   Empty,
   Modal,
   Descriptions,
   Divider,
   Steps,
   message,
   Alert,
   Badge
} from "antd";
import {
   SearchOutlined,
   TruckOutlined,
   EnvironmentOutlined,
   ClockCircleOutlined,
   PhoneOutlined,
   UserOutlined,
   StarFilled,
   FilterOutlined,
   EyeOutlined,
   MessageOutlined,
   InboxOutlined,
   ProfileOutlined,
   CheckCircleOutlined,
   ExclamationCircleOutlined,
   StarOutlined,
   WarningOutlined
} from "@ant-design/icons";
import { orderService } from "../../features/orders/api/orderService";
import { feedbackService } from "../../features/feedback/api/feedbackService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import FeedbackModal from "./components/FeedbackModal";
import ReportViolationModal from "./components/ReportViolationModal";
import FeedbackDisplay from "./components/FeedbackDisplay";
import OrderDetailModal from './OrderDetailModal';

const { Step } = Steps;

const statusConfig = {
   Created: { label: "Đang tìm tài xế", color: "gold", icon: <ClockCircleOutlined /> },
   Accepted: { label: "Đã có tài xế", color: "blue", icon: <UserOutlined /> },
   PickedUp: { label: "Đã lấy hàng", color: "purple", icon: <ProfileOutlined /> },
   Delivering: { label: "Đang giao", color: "orange", icon: <TruckOutlined /> },
   Delivered: { label: "Đã giao", color: "green", icon: <CheckCircleOutlined /> },
   Cancelled: { label: "Đã hủy", color: "red", icon: <ExclamationCircleOutlined /> },
};

export default function OrdersPage() {
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [orders, setOrders] = useState([]);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [detailModalVisible, setDetailModalVisible] = useState(false);

   // Feedback và Report states
   const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
   const [reportModalVisible, setReportModalVisible] = useState(false);
   const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState(null);
   const [selectedDriverForReport, setSelectedDriverForReport] = useState(null);
   const [feedbacks, setFeedbacks] = useState([]);
   const [feedbackStats, setFeedbackStats] = useState(null);
   const [feedbackLoading, setFeedbackLoading] = useState(false);

   // Tải danh sách đơn hàng
   useEffect(() => {
      const fetchOrders = async () => {
         setLoading(true);
         setError(null);

         try {
            // Lấy danh sách đơn hàng của khách hàng
            const status = statusFilter !== "all" ? statusFilter : undefined;
            const response = await orderService.getMyOrders({ status });

            if (response.data?.success) {
               setOrders(response.data.data || []);
            } else {
               setError("Không thể tải danh sách đơn hàng");
            }
         } catch (error) {
            console.error("Lỗi khi tải danh sách đơn hàng:", error);
            setError("Lỗi khi tải danh sách đơn hàng: " + (error.response?.data?.message || error.message));
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, [statusFilter]);

   // Xem chi tiết đơn hàng
   const handleViewDetail = async (orderId) => {
      try {
         setLoading(true);
         const response = await orderService.getOrderDetail(orderId);
         if (response.data?.success) {
            setSelectedOrder(response.data.data);
            setDetailModalVisible(true);

            // Load feedback cho đơn hàng này nếu có
            await loadOrderFeedbacks(orderId);
         } else {
            message.error("Không thể tải chi tiết đơn hàng");
         }
      } catch (error) {
         console.error("Lỗi khi tải chi tiết đơn hàng:", error);
         message.error("Lỗi khi tải chi tiết đơn hàng");
      } finally {
         setLoading(false);
      }
   };

   // Load feedback của đơn hàng
   const loadOrderFeedbacks = async (orderId) => {
      setFeedbackLoading(true);
      try {
         const response = await feedbackService.getOrderFeedbacks(orderId);
         if (response.data?.success) {
            setFeedbacks(response.data.data);
            setFeedbackStats(response.data.stats);
         }
      } catch (error) {
         console.error("Lỗi khi tải feedback:", error);
      } finally {
         setFeedbackLoading(false);
      }
   };

   // Mở modal đánh giá
   const handleOpenFeedback = (order) => {
      setSelectedOrderForFeedback(order);
      setFeedbackModalVisible(true);
   };

   // Mở modal báo cáo
   const handleOpenReport = (order) => {
      const driver = order.items?.find(item => item.status === 'Delivered' && item.driverId)?.driverId;
      if (driver) {
         setSelectedDriverForReport(driver);
         setReportModalVisible(true);
      }
   };

   // Xác nhận hủy đơn hàng
   const confirmCancelOrder = (orderId) => {
      Modal.confirm({
         title: 'Xác nhận hủy đơn hàng',
         icon: <ExclamationCircleOutlined />,
         content: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
         okText: 'Xác nhận',
         cancelText: 'Hủy',
         onOk: async () => {
            try {
               const reason = 'Khách hàng hủy đơn hàng'; // Lý do hủy đơn hàng
               const response = await orderService.cancelOrder(orderId, reason);
               if (response.data?.success) {
                  message.success('Đơn hàng đã được hủy thành công');
                  // Tải lại trang
                  window.location.reload();
               } else {
                  message.error('Không thể hủy đơn hàng');
               }
            } catch (error) {
               console.error('Lỗi khi hủy đơn hàng:', error);
               message.error('Lỗi khi hủy đơn hàng: ' + (error.response?.data?.message || error.message));
            }
         }
      });
   };

   // Lọc đơn hàng theo từ khóa tìm kiếm
   const filteredOrders = orders.filter((order) => {
      const matchesSearch =
         order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.dropoffAddress?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
   });

   // Hiển thị trạng thái đơn hàng
   const renderOrderStatus = (status) => {
      const config = statusConfig[status] || { label: status, color: "default", icon: <ClockCircleOutlined /> };
      return (
         <Tag color={config.color}>
            {config.icon}
            <span style={{ marginLeft: 6 }}>{config.label}</span>
         </Tag>
      );
   };

   // Hiển thị các bước đơn hàng
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

   // Tính số lượng đơn hàng theo trạng thái
   const countOrdersByStatus = (status) => {
      return orders.reduce((count, order) => {
         const hasItemWithStatus = order.items.some(item => item.status === status);
         return hasItemWithStatus ? count + 1 : count;
      }, 0);
   };

   // Tính tổng doanh thu từ các đơn hàng đã giao
   const calculateTotalRevenue = () => {
      return orders.reduce((total, order) => {
         // Chỉ tính các đơn hàng có ít nhất một mục đã giao
         const hasDeliveredItems = order.items.some(item => item.status === "Delivered");
         if (hasDeliveredItems) {
            return total + order.totalPrice;
         }
         return total;
      }, 0);
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôis</h1>
                  <p className="text-blue-100">Theo dõi và quản lý các đơn hàng của bạn</p>
               </div>
               <div className="text-right">
                  <div className="text-4xl font-bold">{orders.length}</div>
                  <p className="text-blue-100">Tổng đơn hàng</p>
               </div>
            </div>
         </div>

         {/* Stats Cards */}
         <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đang chờ tài xế"
                     value={countOrdersByStatus("Created")}
                     prefix={<ClockCircleOutlined />}
                     valueStyle={{ color: "#d97706" }}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Đang thực hiện"
                     value={countOrdersByStatus("Accepted") + countOrdersByStatus("PickedUp") + countOrdersByStatus("Delivering")}
                     prefix={<TruckOutlined />}
                     valueStyle={{ color: "#1d4ed8" }}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Hoàn thành"
                     value={countOrdersByStatus("Delivered")}
                     prefix={<CheckCircleOutlined />}
                     valueStyle={{ color: "#16a34a" }}
                  />
               </Card>
            </Col>
            <Col xs={24} sm={6}>
               <Card className="text-center hover:shadow-lg transition-shadow">
                  <Statistic
                     title="Tổng chi phí"
                     value={calculateTotalRevenue()}
                     precision={0}
                     prefix={<StarFilled />}
                     valueStyle={{ color: "#7c3aed" }}
                     formatter={(v) => formatCurrency(v)}
                  />
               </Card>
            </Col>
         </Row>

         <Card className="shadow-sm">
            <Row gutter={[16, 16]}>
               <Col xs={24} md={8}>
                  <Input
                     placeholder="Tìm kiếm đơn hàng..."
                     prefix={<SearchOutlined />}
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     allowClear
                     size="large"
                  />
               </Col>
               <Col xs={24} md={8}>
                  <Select
                     value={statusFilter}
                     onChange={setStatusFilter}
                     style={{ width: "100%" }}
                     placeholder="Trạng thái"
                     size="large"
                  >
                     <Select.Option value="all">Tất cả trạng thái</Select.Option>
                     <Select.Option value="Created">Đang tìm tài xế</Select.Option>
                     <Select.Option value="Accepted">Đã có tài xế</Select.Option>
                     <Select.Option value="PickedUp">Đã lấy hàng</Select.Option>
                     <Select.Option value="Delivering">Đang giao</Select.Option>
                     <Select.Option value="Delivered">Đã giao</Select.Option>
                     <Select.Option value="Cancelled">Đã hủy</Select.Option>
                  </Select>
               </Col>
               <Col xs={24} md={8}>
                  <Button type="primary" icon={<FilterOutlined />} size="large" block>
                     Lọc ({filteredOrders.length})
                  </Button>
               </Col>
            </Row>
         </Card>

         {error && (
            <Alert
               message="Lỗi"
               description={error}
               type="error"
               showIcon
               className="mx-4 mb-4"
            />
         )}

         {loading ? (
            <div className="flex justify-center py-10">
               <Spin size="large" tip="Đang tải đơn hàng..." />
            </div>
         ) : (
            <div className="space-y-4">
               {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                     const hasDeliveredItems = order.items.some(item => item.status === 'Delivered');
                     const hasDriver = order.items.some(item => item.status === 'Delivered' && item.driverId);

                     return (
                        <Card
                           key={order._id}
                           className={`shadow-lg hover:shadow-xl transition-shadow ${hasDeliveredItems ? 'border-l-4 border-l-green-500' :
                              order.items.some(item => ['Accepted', 'PickedUp', 'Delivering'].includes(item.status)) ? 'border-l-4 border-l-blue-500' :
                                 'border-l-4 border-l-gray-300'
                              }`}
                        >
                           <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                       <span className="text-lg font-bold text-blue-600">#{order._id.substring(0, 8)}</span>
                                    </div>
                                    <div>
                                       <h3 className="font-semibold text-lg">Đơn hàng #{order._id.substring(0, 8)}</h3>
                                       <p className="text-sm text-gray-500">{formatDate(order.createdAt, true)}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                       {formatCurrency(order.totalPrice)}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(order._id)}>
                                          Chi tiết
                                       </Button>
                                       {/* Nút đánh giá cho đơn đã hoàn thành */}
                                       {hasDeliveredItems && (
                                          <Button
                                             size="small"
                                             type="primary"
                                             icon={<StarOutlined />}
                                             onClick={() => handleOpenFeedback(order)}
                                             className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500"
                                          >
                                             Đánh giá
                                          </Button>
                                       )}
                                       {/* Nút báo cáo cho đơn đã hoàn thành */}
                                       {hasDriver && (
                                          <Button
                                             size="small"
                                             danger
                                             icon={<WarningOutlined />}
                                             onClick={() => handleOpenReport(order)}
                                          >
                                             Báo cáo
                                          </Button>
                                       )}
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
                                 {order.items.map((item, index) => (
                                    <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                       <Row gutter={[16, 8]} align="middle">
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
                                                <div className="text-xl font-bold text-blue-600">
                                                   {formatCurrency(item.priceBreakdown?.total || 0)}
                                                </div>
                                                <p className="text-sm text-gray-500">Chi phí vận chuyển</p>
                                             </div>
                                          </Col>
                                       </Row>
                                    </div>
                                 ))}
                              </div>

                              {/* Driver Info */}
                              {order.items.some(item => item.driverId) ? (
                                 <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3">Thông tin tài xế</h4>
                                    {order.items.map((item, index) => {
                                       if (!item.driverId) return null;
                                       const driver = item.driverId;
                                       return (
                                          <Row key={index} gutter={[16, 16]} align="middle">
                                             <Col xs={24} sm={12}>
                                                <div className="flex items-center space-x-3">
                                                   <Avatar src={driver.avatarUrl} icon={<UserOutlined />} size="large" />
                                                   <div>
                                                      <div className="font-semibold text-lg">{driver.userId?.name || "Tài xế"}</div>
                                                      <div className="flex items-center space-x-2">
                                                         <StarFilled className="text-yellow-500" />
                                                         <span className="font-medium">{driver.rating || "N/A"}</span>
                                                         <span className="text-sm text-gray-500">({driver.totalTrips || 0} chuyến)</span>
                                                      </div>
                                                   </div>
                                                </div>
                                             </Col>
                                             <Col xs={24} sm={12}>
                                                <div className="space-y-2">
                                                   <div className="flex items-center space-x-2">
                                                      <PhoneOutlined className="text-blue-500" />
                                                      <span>{driver.userId?.phone || "N/A"}</span>
                                                   </div>
                                                   <div className="flex items-center space-x-2">
                                                      <TruckOutlined className="text-green-500" />
                                                      <span>{item.vehicleType}</span>
                                                   </div>
                                                </div>
                                             </Col>
                                          </Row>
                                       );
                                    })}
                                 </div>
                              ) : (
                                 <div className="bg-gray-50 p-4 rounded-lg text-center">
                                    <ClockCircleOutlined className="text-4xl text-gray-400 mb-2" />
                                    <div className="text-lg font-medium text-gray-600">Đang tìm tài xế phù hợp</div>
                                    <div className="text-sm text-gray-500">Thời gian chờ dự kiến: 5-10 phút</div>
                                 </div>
                              )}
                           </div>
                        </Card>
                     );
                  })
               ) : (
                  <Card className="w-full text-center">
                     <Space direction="vertical" size={8}>
                        <InboxOutlined style={{ fontSize: 48, color: "#9ca3af" }} />
                        <div className="text-lg font-semibold">Không tìm thấy đơn hàng</div>
                        <div className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                     </Space>
                  </Card>
               )}
            </div>
         )}

         {/* Modal chi tiết đơn hàng */}
         <OrderDetailModal
            visible={detailModalVisible}
            onClose={() => setDetailModalVisible(false)}
            order={selectedOrder}
            feedbacks={feedbacks}
            feedbackStats={feedbackStats}
            feedbackLoading={feedbackLoading}
            onCancelOrder={confirmCancelOrder}
            onOpenFeedback={handleOpenFeedback}
            onOpenReport={handleOpenReport}
         />

         {/* Modal đánh giá */}
         <FeedbackModal
            open={feedbackModalVisible}
            onClose={() => setFeedbackModalVisible(false)}
            order={selectedOrderForFeedback}
            onSuccess={() => {
               message.success('Đánh giá đã được gửi thành công!');
               setFeedbackModalVisible(false);
               // Reload feedback nếu đang xem chi tiết
               if (selectedOrder) {
                  loadOrderFeedbacks(selectedOrder._id);
               }
            }}
         />

         {/* Modal báo cáo */}
         <ReportViolationModal
            open={reportModalVisible}
            onClose={() => setReportModalVisible(false)}
            driver={selectedDriverForReport}
            order={selectedOrderForFeedback}
            onSuccess={() => {
               message.success('Báo cáo vi phạm đã được gửi thành công!');
               setReportModalVisible(false);
            }}
         />
      </div>
   );
}