"use client"

import React, { useState, useEffect, useRef } from "react"
import { Form, Card, App } from "antd"
import { useLocation, useNavigate } from "react-router-dom"
import { io } from 'socket.io-client'

import OrderForm from "./components/OrderForm"
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
   const user = useLocalUser();
   const socketRef = useRef(null);

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

      const socket = io(SOCKET_URL, { transports: ['websocket'], withCredentials: false })
      socketRef.current = socket

      socket.on('connect', () => {
         socket.emit('customer:join', user._id)
         console.log('✅ Customer đã join room')
      })

      // Lắng nghe khi tài xế nhận đơn
      socket.on('order:accepted', (payload) => {
         console.log('📨 Nhận được order:accepted:', payload)
         if (payload.orderId === createdOrderId) {
            messageApi.success(`Tài xế ${payload.driverName} đã nhận đơn của bạn!`)
            // Chuyển sang màn hình tracking
            setTimeout(() => {
               navigate(`/dashboard/order-tracking/${createdOrderId}`)
            }, 1500)
         }
      })

      return () => {
         socket.disconnect()
      }
   }, [createdOrderId, user?._id, navigate])

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
            messageApi.success("Đã tạo đơn hàng, đang tìm tài xế gần bạn...");
            setFindingDrivers(false);
            // Không navigate ngay, đợi tài xế nhận đơn
         } else {
            messageApi.error("Lỗi khi tạo đơn hàng: " + (response.data?.message || "Vui lòng thử lại"));
            setFindingDrivers(false);
         }
      } catch (error) {
         console.error("Lỗi khi tìm tài xế:", error);
         messageApi.error("Lỗi khi tìm tài xế: " + (error.response?.data?.message || error.message || "Vui lòng thử lại"));
         setFindingDrivers(false);
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

         {/* Hiển thị trạng thái đang tìm tài xế */}
         {createdOrderId && (
            <Card className="mt-4">
               <div className="text-center py-6">
                  <div className="text-2xl font-semibold mb-2 text-blue-600">Đang tìm tài xế...</div>
                  <div className="text-gray-600 mb-4">
                     Hệ thống đang quét các tài xế gần bạn trong bán kính 2km có xe phù hợp với trọng tải yêu cầu
                  </div>
                  <div className="text-sm text-gray-500">
                     Vui lòng đợi tài xế xác nhận nhận đơn
                  </div>
               </div>
            </Card>
         )}
      </div>
   )
}
