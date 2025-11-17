import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { driverService } from '../../features/driver/api/driverService';
import { orderService } from '../../features/orders/api/orderService';
import NewOrderPopup from '../../pages/driver/components/NewOrderPopup';

/**
 * Component quản lý popup đơn hàng mới cho tài xế
 * Component này được mount ở DriverDashboardLayout để hiển thị popup ở mọi trang
 */
export default function DriverOrderPopupManager() {
   const navigate = useNavigate();
   const [newOrderPopupVisible, setNewOrderPopupVisible] = useState(false);
   const [newOrderData, setNewOrderData] = useState(null);
   const [acceptingOrder, setAcceptingOrder] = useState(false);
   const [rejectingOrder, setRejectingOrder] = useState(false);
   const popupTimeoutRef = useRef(null);
   const socketRef = useRef(null);

   // Kết nối Socket.IO để nhận đơn mới realtime
   useEffect(() => {
      // Lấy driverId trước khi kết nối socket
      const setupSocket = async () => {
         try {
            // Lấy thông tin tài xế để có driverId
            const driverInfoRes = await driverService.getDriverInfo();
            const driverId = driverInfoRes.data?.data?._id;
            
            if (!driverId) {
               console.error('❌ [DriverOrderPopupManager] Không thể lấy driverId');
               return;
            }

            // Disconnect socket cũ nếu có
            if (socketRef.current) {
               console.log('🔄 [DriverOrderPopupManager] Đang disconnect socket cũ...');
               socketRef.current.disconnect();
               socketRef.current = null;
            }

            // Lấy Socket.IO URL từ biến môi trường
            let SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

            // Trong DEV mode: Nếu truy cập từ IP (không phải localhost) và SOCKET_URL chứa localhost
            // thì tự động thay localhost bằng IP hiện tại để hoạt động với mobile
            if (import.meta.env.DEV && typeof window !== 'undefined') {
               const currentHost = window.location.hostname;
               if (currentHost !== 'localhost' && currentHost !== '127.0.0.1' && SOCKET_URL.includes('localhost')) {
                  // Thay localhost bằng IP hiện tại, giữ nguyên port
                  SOCKET_URL = SOCKET_URL.replace('localhost', currentHost).replace('127.0.0.1', currentHost);
                  console.log('🔧 [DEV MODE] Socket.IO URL đã được tự động chuyển từ localhost sang:', SOCKET_URL);
               }
            }

            console.log(`🔌 [DriverOrderPopupManager] Đang kết nối đến ${SOCKET_URL}...`);
            const socket = io(SOCKET_URL, { 
               transports: ['websocket'], 
               withCredentials: false,
               reconnection: true,
               reconnectionDelay: 1000,
               reconnectionAttempts: 5
            });
            socketRef.current = socket;

            socket.on('connect', () => {
               console.log(`✅ [DriverOrderPopupManager] Đã kết nối thành công với socket ID: ${socket.id}`);
               
               // Join room cho tài xế với driverId thực tế
               socket.emit('driver:join', driverId.toString());
               console.log(`📤 [DriverOrderPopupManager] Đã emit driver:join với driverId: ${driverId}`);
            });

            socket.on('connect_error', (error) => {
               console.error('❌ [DriverOrderPopupManager] Lỗi kết nối:', error);
            });

            socket.on('disconnect', () => {
               console.log('❌ [DriverOrderPopupManager] Socket đã disconnect');
            });

            // Lắng nghe popup đơn hàng mới (CHỈ gửi cho tài xế gần nhất)
            socket.on('order:popup:new', (payload) => {
               console.log('\n📨 [DriverOrderPopupManager] ========== NHẬN POPUP ĐƠN HÀNG MỚI ==========');
               console.log('📥 [DriverOrderPopupManager] Socket event: order:popup:new', payload);
               console.log('📥 [DriverOrderPopupManager] Khoảng cách từ bạn: ', payload.distanceFromDriver ? `${(payload.distanceFromDriver / 1000).toFixed(2)} km` : 'N/A');
               
               // Xóa timeout cũ nếu có
               if (popupTimeoutRef.current) {
                  clearTimeout(popupTimeoutRef.current);
                  popupTimeoutRef.current = null;
               }
               
               // Hiển thị popup ngay lập tức
               setNewOrderData(payload);
               setNewOrderPopupVisible(true);
               
               // Thông báo bằng message để thu hút sự chú ý
               const distanceText = payload.distanceFromDriver ? `${(payload.distanceFromDriver / 1000).toFixed(2)} km` : 'gần bạn';
               message.warning({
                  content: `🚨 Có đơn hàng mới cách bạn ${distanceText}!`,
                  duration: 5,
                  icon: <CarOutlined style={{ color: '#1890ff' }} />
               });
               
               // Tự động từ chối sau 30 giây nếu không phản hồi
               popupTimeoutRef.current = setTimeout(async () => {
                  console.log('⏰ [DriverOrderPopupManager] Popup tự động đóng sau 30 giây - Tự động từ chối đơn');
                  
                  // Tự động từ chối nếu không phản hồi
                  if (payload.orderId && payload.itemId) {
                     try {
                        await orderService.rejectItem(payload.orderId, payload.itemId);
                        message.info("Đã tự động từ chối đơn hàng do không phản hồi. Đơn sẽ được chuyển cho tài xế khác.");
                     } catch (error) {
                        console.error("Lỗi khi tự động từ chối đơn:", error);
                        message.error("Lỗi khi tự động từ chối đơn hàng");
                     }
                  }
                  
                  // Đóng popup
                  setNewOrderPopupVisible(false);
                  setNewOrderData(null);
                  popupTimeoutRef.current = null;
               }, 30000); // 30 giây
            });

         } catch (error) {
            console.error('❌ [DriverOrderPopupManager] Lỗi khi setup socket:', error);
         }
      };

      setupSocket();

      return () => {
         try { 
            // Xóa timeout nếu có
            if (popupTimeoutRef.current) {
               clearTimeout(popupTimeoutRef.current);
               popupTimeoutRef.current = null;
            }
            
            if (socketRef.current) {
               socketRef.current.disconnect();
            }
         } catch (error) {
            console.error('❌ [DriverOrderPopupManager] Lỗi khi cleanup socket:', error);
         }
         socketRef.current = null;
      };
   }, []); // Chỉ chạy một lần khi mount

   // Nhận đơn hàng từ popup
   const handleAcceptOrder = async (orderId, itemId) => {
      try {
         setAcceptingOrder(true);
         
         // Xóa timeout tự động đóng
         if (popupTimeoutRef.current) {
            clearTimeout(popupTimeoutRef.current);
            popupTimeoutRef.current = null;
         }

         console.log(`🔄 [DriverOrderPopupManager] Đang nhận đơn ${orderId}, item ${itemId}`);
         
         const response = await orderService.acceptItem(orderId, itemId);
         if (response.data?.success) {
            message.success("Nhận đơn hàng thành công! Đơn đã được chuyển sang tab 'Đơn đang giao'");

            // Đóng popup
            setNewOrderPopupVisible(false);
            setNewOrderData(null);
            
            // Navigate đến trang orders nếu chưa ở đó
            if (!window.location.pathname.includes('/driver/orders')) {
               navigate('/driver/orders');
            } else {
               // Nếu đang ở trang orders, reload để cập nhật danh sách
               window.location.reload();
            }
            
            console.log(`✅ [DriverOrderPopupManager] Đã nhận đơn thành công`);
         } else {
            message.error(response.data?.message || "Không thể nhận đơn hàng");
         }
      } catch (error) {
         console.error("❌ [DriverOrderPopupManager] Lỗi khi nhận đơn hàng:", error);
         message.error("Lỗi khi nhận đơn hàng: " + (error.response?.data?.message || error.message));
      } finally {
         setAcceptingOrder(false);
      }
   };

   // Từ chối đơn hàng từ popup
   const handleRejectOrder = async (orderId, itemId) => {
      try {
         setRejectingOrder(true);
         
         // Xóa timeout tự động đóng
         if (popupTimeoutRef.current) {
            clearTimeout(popupTimeoutRef.current);
            popupTimeoutRef.current = null;
         }

         console.log(`🔄 [DriverOrderPopupManager] Đang từ chối đơn ${orderId}, item ${itemId}`);
         
         const response = await orderService.rejectItem(orderId, itemId);
         if (response.data?.success) {
            message.success("Đã từ chối đơn hàng. Đơn sẽ được gửi cho tài xế khác.");
            
            // Đóng popup
            setNewOrderPopupVisible(false);
            setNewOrderData(null);
            
            console.log(`✅ [DriverOrderPopupManager] Đã từ chối đơn thành công`);
         } else {
            message.error(response.data?.message || "Không thể từ chối đơn hàng");
         }
      } catch (error) {
         console.error("❌ [DriverOrderPopupManager] Lỗi khi từ chối đơn hàng:", error);
         message.error("Lỗi khi từ chối đơn hàng: " + (error.response?.data?.message || error.message));
      } finally {
         setRejectingOrder(false);
      }
   };

   return (
      <NewOrderPopup
         visible={newOrderPopupVisible}
         orderData={newOrderData}
         onAccept={() => {
            if (newOrderData?.orderId && newOrderData?.itemId) {
               handleAcceptOrder(newOrderData.orderId, newOrderData.itemId);
            }
         }}
         onReject={() => {
            if (newOrderData?.orderId && newOrderData?.itemId) {
               handleRejectOrder(newOrderData.orderId, newOrderData.itemId);
            }
         }}
         accepting={acceptingOrder}
         rejecting={rejectingOrder}
      />
   );
}

