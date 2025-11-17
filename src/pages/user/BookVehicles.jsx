"use client"

import React, { useState, useEffect, useRef } from "react"
import { Form, Card, App } from "antd"
import { useLocation, useNavigate } from "react-router-dom"
import { io } from 'socket.io-client'

import OrderForm from "./components/OrderForm"
import FindingDriverModal from "./components/FindingDriverModal"
import { orderService } from "../../features/orders/api/orderService"
import { formatCurrency } from "../../utils/formatters"
import useLocalUser from "../../authentication/hooks/useLocalUser"

export default function BookVehicles() {
   const { message: messageApi } = App.useApp();
   const [form] = Form.useForm();
   const navigate = useNavigate();
   const location = useLocation();

   // States
   const [createdOrderId, setCreatedOrderId] = useState(null);
   const [findingDrivers, setFindingDrivers] = useState(false);
   const [calculatedDistance, setCalculatedDistance] = useState(null);
   const [totalPrice, setTotalPrice] = useState(0);
   const [driverFound, setDriverFound] = useState(false);
   const [driverName, setDriverName] = useState(null);
   const [showFindingModal, setShowFindingModal] = useState(false);
   const user = useLocalUser();
   const socketRef = useRef(null);
   const timeoutRef = useRef(null); // Ref để lưu timeout 2 phút

   // Xử lý khi khoảng cách thay đổi từ OrderForm
   const handleDistanceChange = (distance) => {
      setCalculatedDistance(distance);
   };

   // Tính giá dựa trên form values - sử dụng Form.useWatch để theo dõi thay đổi
   const weightKg = Form.useWatch('weightKg', form);
   const [priceBreakdown, setPriceBreakdown] = useState(null); // Breakdown giá chi tiết
   
   useEffect(() => {
      if (!weightKg || weightKg <= 0) {
         setTotalPrice(0);
         setPriceBreakdown(null);
         return;
      }

      const distanceKm = calculatedDistance && calculatedDistance > 0 
         ? calculatedDistance 
         : null; // Không dùng mặc định nữa, đợi có khoảng cách thực tế

      if (!distanceKm) {
         setTotalPrice(0);
         setPriceBreakdown(null);
         return;
      }

      // Tính giá theo trọng lượng (tấn)
      const ton = Number(weightKg) / 1000;
      let pricePerKm = 40000;
      if (ton <= 1) pricePerKm = 40000;
      else if (ton <= 3) pricePerKm = 60000;
      else if (ton <= 5) pricePerKm = 80000;
      else if (ton <= 10) pricePerKm = 100000;
      else pricePerKm = 150000;

      // Tính giá theo khoảng cách
      const distanceCost = pricePerKm * distanceKm;
      setTotalPrice(distanceCost);

      // Lưu breakdown để hiển thị
      setPriceBreakdown({
         distanceKm: distanceKm.toFixed(1),
         pricePerKm: pricePerKm,
         distanceCost: distanceCost,
         weightKg: Number(weightKg),
         ton: ton.toFixed(2)
      });
   }, [weightKg, calculatedDistance]);

   // Setup Socket.IO để nhận updates khi tài xế nhận đơn
   useEffect(() => {
      if (!createdOrderId || !user?._id) return

      let SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'
      
      if (import.meta.env.DEV && typeof window !== 'undefined') {
         const currentHost = window.location.hostname
         if (currentHost !== 'localhost' && currentHost !== '127.0.0.1' && SOCKET_URL.includes('localhost')) {
            SOCKET_URL = SOCKET_URL.replace('localhost', currentHost).replace('127.0.0.1', currentHost)
         }
      }

      // Disconnect socket cũ nếu có
      if (socketRef.current) {
         socketRef.current.disconnect()
      }

      const socket = io(SOCKET_URL, { transports: ['websocket'], withCredentials: false })
      socketRef.current = socket

      socket.on('connect', () => {
         socket.emit('customer:join', user._id)
         console.log('✅ Customer đã join room:', user._id)
      })

      socket.on('connect_error', (error) => {
         console.error('❌ Socket connection error:', error)
      })

      // Lắng nghe khi tài xế nhận đơn
      socket.on('order:accepted', (payload) => {
         console.log('📨 Nhận được order:accepted:', payload)
         console.log('📨 Created Order ID:', createdOrderId)
         console.log('📨 Payload Order ID:', payload.orderId)
         
         // So sánh orderId dưới dạng string để tránh vấn đề type mismatch
         if (String(payload.orderId) === String(createdOrderId)) {
            console.log('✅ Order ID khớp, cập nhật popup')
            
            // Xóa timeout nếu có
            if (timeoutRef.current) {
               clearTimeout(timeoutRef.current)
               timeoutRef.current = null
            }
            
            // Cập nhật popup thành "Đã tìm thấy tài xế"
            setDriverFound(true);
            setDriverName(payload.driverName || 'Tài xế');
            
            // Sau 2 giây, chuyển sang trang đơn hàng và mở chi tiết đơn
            setTimeout(() => {
               setShowFindingModal(false);
               navigate(`/dashboard/orders?orderId=${createdOrderId}&openDetail=true`)
            }, 2000)
         } else {
            console.log('⚠️ Order ID không khớp:', {
               payloadOrderId: payload.orderId,
               createdOrderId: createdOrderId,
               payloadOrderIdType: typeof payload.orderId,
               createdOrderIdType: typeof createdOrderId
            })
         }
      })

      return () => {
         if (socketRef.current) {
            socketRef.current.disconnect()
         }
      }
   }, [createdOrderId, user?._id, navigate])

   // Polling fallback: Kiểm tra trạng thái đơn mỗi 3 giây nếu chưa có tài xế
   useEffect(() => {
      if (!createdOrderId || !showFindingModal || driverFound) return

      const checkOrderStatus = async () => {
         try {
            const response = await orderService.getOrderDetail(createdOrderId)
            if (response.data?.success) {
               const order = response.data.data
               // Kiểm tra xem có item nào đã được nhận chưa
               const hasAcceptedItem = order.items?.some(item => 
                  item.status === 'Accepted' && item.driverId
               )

               if (hasAcceptedItem) {
                  console.log('✅ Phát hiện tài xế đã nhận đơn qua polling')
                  const acceptedItem = order.items.find(item => 
                     item.status === 'Accepted' && item.driverId
                  )
                  
                  if (acceptedItem?.driverId?.userId) {
                     // Xóa timeout nếu có
                     if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current)
                        timeoutRef.current = null
                     }
                     
                     setDriverFound(true)
                     setDriverName(acceptedItem.driverId.userId.name || 'Tài xế')
                     
                     setTimeout(() => {
                        setShowFindingModal(false)
                        navigate(`/dashboard/orders?orderId=${createdOrderId}&openDetail=true`)
                     }, 2000)
                  }
               }
            }
         } catch (error) {
            console.error('❌ Lỗi khi kiểm tra trạng thái đơn:', error)
         }
      }

      // Kiểm tra ngay lập tức
      checkOrderStatus()

      // Sau đó kiểm tra mỗi 3 giây
      const interval = setInterval(checkOrderStatus, 3000)

      return () => clearInterval(interval)
   }, [createdOrderId, showFindingModal, driverFound, navigate])

   // Timeout 2 phút: Tự động đóng popup nếu chưa có tài xế
   useEffect(() => {
      if (!showFindingModal || !createdOrderId || driverFound) {
         // Xóa timeout nếu popup đóng hoặc đã tìm thấy tài xế
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
         }
         return
      }

      // Bắt đầu đếm ngược 2 phút (120 giây)
      console.log('⏰ [BookVehicles] Bắt đầu đếm ngược 2 phút cho popup tìm tài xế')
      
      timeoutRef.current = setTimeout(() => {
         console.log('⏰ [BookVehicles] Đã hết 2 phút, tự động đóng popup')
         
         // Đóng popup
         setShowFindingModal(false)
         
         // Reset state để user có thể bấm lại nút "Tìm tài xế"
         setCreatedOrderId(null)
         setDriverFound(false)
         setDriverName(null)
         
         // Thông báo cho user
         messageApi.warning({
            content: 'Đã hết thời gian tìm tài xế (2 phút). Vui lòng bấm lại nút "Tìm tài xế" để tiếp tục.',
            duration: 5
         })
         
         timeoutRef.current = null
      }, 120000) // 2 phút = 120,000ms

      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
         }
      }
   }, [showFindingModal, createdOrderId, driverFound, messageApi])

   // Xử lý tìm tài xế (thay vì submit trực tiếp)
   const handleFindDrivers = async (values) => {
      const { 
         pickupAddress, 
         dropoffAddress, 
         customerNote, 
         paymentBy = "sender",
         pickupLat,
         pickupLng,
         dropoffLat,
         dropoffLng,
         weightKg
      } = values;

      // Validate trọng tải
      if (!weightKg || weightKg <= 0) {
         messageApi.error("Vui lòng nhập trọng tải hàng hóa");
         return;
      }

      // Validate tọa độ
      if (!pickupLat || !pickupLng) {
         messageApi.error("Vui lòng chọn điểm đón trên bản đồ");
         return;
      }

      setFindingDrivers(true);

      try {
         // Tính khoảng cách - đảm bảo luôn có giá trị hợp lệ
         let distanceKm = calculatedDistance && calculatedDistance > 0 
            ? calculatedDistance 
            : null;
         
         // Nếu chưa có khoảng cách, tính tạm thời dựa trên tọa độ (Haversine)
         if (!distanceKm && pickupLat && pickupLng && dropoffLat && dropoffLng) {
            const R = 6371; // Bán kính Trái Đất (km)
            const dLat = (dropoffLat - pickupLat) * Math.PI / 180;
            const dLon = (dropoffLng - pickupLng) * Math.PI / 180;
            const a = 
               Math.sin(dLat / 2) * Math.sin(dLat / 2) +
               Math.cos(pickupLat * Math.PI / 180) * Math.cos(dropoffLat * Math.PI / 180) *
               Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distanceKm = R * c;
         }
         
         // Nếu vẫn không có khoảng cách, dùng mặc định
         if (!distanceKm || distanceKm <= 0) {
            distanceKm = 10; // Mặc định 10km
         }

         // Đảm bảo weightKg là number
         const weightKgNum = Number(weightKg);
         if (isNaN(weightKgNum) || weightKgNum <= 0) {
            messageApi.error("Trọng tải hàng hóa không hợp lệ");
            setFindingDrivers(false);
            return;
         }

         // Tính giá theo trọng lượng
         const ton = weightKgNum / 1000;
         let pricePerKm = 40000;
         if (ton <= 1) pricePerKm = 40000;
         else if (ton <= 3) pricePerKm = 60000;
         else if (ton <= 5) pricePerKm = 80000;
         else if (ton <= 10) pricePerKm = 100000;
         else pricePerKm = 150000;

         // Chuẩn bị dữ liệu đơn hàng
         const orderData = {
            pickupAddress,
            dropoffAddress,
            customerNote,
            paymentMethod: "Cash",
            paymentBy,
            pickupLocation: {
               type: "Point",
               coordinates: [Number(pickupLng), Number(pickupLat)]
            },
            ...(dropoffLat && dropoffLng && {
               dropoffLocation: {
                  type: "Point",
                  coordinates: [Number(dropoffLng), Number(dropoffLat)]
               }
            }),
            items: [{
               vehicleType: null, // Không cần vehicleType cụ thể (theo luồng mới)
               vehicleId: null,
               pricePerKm: pricePerKm,
               weightKg: weightKgNum,
               distanceKm: Number(distanceKm.toFixed(2)), // Làm tròn 2 chữ số thập phân
               loadingService: false,
               insurance: false,
               itemPhotos: []
            }]
         };

         // Tạo đơn hàng
         const response = await orderService.createOrder(orderData);

         if (response.data?.success) {
            const orderId = response.data.data._id;
            setCreatedOrderId(orderId);
            setDriverFound(false);
            setDriverName(null);
            setFindingDrivers(false);
            setShowFindingModal(true); // Hiển thị popup ngay lập tức
            console.log('✅ Đơn hàng đã được tạo, hiển thị popup tìm tài xế:', orderId);
         } else {
            messageApi.error("Lỗi khi tạo đơn hàng: " + (response.data?.message || "Vui lòng thử lại"));
            setFindingDrivers(false);
            setShowFindingModal(false);
         }
      } catch (error) {
         console.error("Lỗi khi tìm tài xế:", error);
         messageApi.error("Lỗi khi tìm tài xế: " + (error.response?.data?.message || error.message || "Vui lòng thử lại"));
         setFindingDrivers(false);
         setShowFindingModal(false);
      }
   };

   return (
      <div className="h-full overflow-auto">
         {/* Order Form - Vào thẳng form đặt hàng */}
         <OrderForm
            form={form}
            onSubmit={handleFindDrivers}
            submitting={findingDrivers}
            totalPrice={totalPrice}
            formatCurrency={formatCurrency}
            onDistanceChange={handleDistanceChange}
            buttonText={createdOrderId ? "Đang tìm tài xế..." : "Tìm tài xế"}
            disabled={!!createdOrderId}
            priceBreakdown={priceBreakdown}
         />

         {/* Popup tìm tài xế */}
         <FindingDriverModal
            visible={showFindingModal && !!createdOrderId}
            orderId={createdOrderId}
            driverFound={driverFound}
            driverName={driverName}
         />
      </div>
   )
}
