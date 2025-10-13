import React, { useState, useEffect } from "react";
import { Spin, Alert, message, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { orderService } from "../../features/orders/api/orderService";
import { feedbackService } from "../../features/feedback/api/feedbackService";
import FeedbackModal from "./components/FeedbackModal";
import ReportViolationModal from "./components/ReportViolationModal";
import OrderDetailModal from './OrderDetailModal';
import OrderCard from './components/OrderCard';
import OrderStats from './components/OrderStats';
import OrderFilters from './components/OrderFilters';
import OrderEmpty from './components/OrderEmpty';

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
   const handleViewDetail = async (orderId, driverInfo = null) => {
      try {
         setLoading(true);
         const response = await orderService.getOrderDetail(orderId);

         if (response.data?.success) {
            // Nếu có driverInfo từ OrderCard, merge vào order data
            const orderData = response.data.data;

            if (driverInfo && orderData.items) {
               orderData.items = orderData.items.map(item => {
                  // Nếu có driverId nhưng chưa populate userId đầy đủ
                  if (item.driverId) {
                     // Kiểm tra xem có populate đầy đủ không
                     const isFullyPopulated = item.driverId.userId &&
                        item.driverId.userId.name &&
                        item.driverId.userId.phone;

                     if (!isFullyPopulated) {
                        return { ...item, driverId: driverInfo };
                     }
                  }
                  return item;
               });
            }

            setSelectedOrder(orderData);
            setDetailModalVisible(true);
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
         okType: 'danger',
         cancelText: 'Hủy',
         onOk: async () => {
            try {
               const reason = 'Khách hàng hủy đơn hàng';
               const response = await orderService.cancelOrder(orderId, reason);
               if (response.data?.success) {
                  message.success('Đơn hàng đã được hủy thành công');
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

   const hasFilters = searchTerm || statusFilter !== "all";

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
         {/* Header */}
         <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-xl">
               <div className="flex items-center justify-between">
                  <div>
                     <h1 className="text-4xl font-bold text-white mb-2">Đơn hàng của tôi</h1>
                     <p className="text-blue-100 text-lg">Theo dõi và quản lý các đơn hàng của bạn</p>
                  </div>
                  <div className="text-right bg-white bg-opacity-20 rounded-xl p-6 backdrop-blur-sm">
                     <div className="text-5xl font-bold text-white">{orders.length}</div>
                     <p className="text-blue-100 font-medium mt-1">Tổng đơn hàng</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="mb-8">
            <OrderStats orders={orders} />
         </div>

         {/* Filters */}
         <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <OrderFilters
               searchTerm={searchTerm}
               setSearchTerm={setSearchTerm}
               statusFilter={statusFilter}
               setStatusFilter={setStatusFilter}
               filteredCount={filteredOrders.length}
            />
         </div>

         {/* Error Alert */}
         {error && (
            <Alert
               message="Lỗi"
               description={error}
               type="error"
               showIcon
               closable
               onClose={() => setError(null)}
               className="mb-6 rounded-xl"
            />
         )}

         {/* Orders List */}
         {loading ? (
            <div className="flex justify-center items-center py-20">
               <Spin size="large">
                  <div className="py-10">Đang tải đơn hàng...</div>
               </Spin>
            </div>
         ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
               {filteredOrders.map((order) => (
                  <OrderCard
                     key={order._id}
                     order={order}
                     onViewDetail={handleViewDetail}
                     onOpenFeedback={handleOpenFeedback}
                     onOpenReport={handleOpenReport}
                  />
               ))}
            </div>
         ) : (
            <OrderEmpty hasFilters={hasFilters} />
         )}

         {/* Modal chi tiết đơn hàng */}
         <OrderDetailModal
            open={detailModalVisible}
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
