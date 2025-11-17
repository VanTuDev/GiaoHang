"use client"

import React, { useState, useEffect, useRef } from "react"
import { Form, message } from "antd"
import { useLocation, useNavigate } from "react-router-dom"
import { io } from 'socket.io-client'

import VehicleDetailModal from "./modal/VehicleDetailModal"
import SearchFilters from "./components/SearchFilters"
import VehicleGrid from "./components/VehicleGrid"
import OrderSummary from "./components/OrderSummary"
import OrderForm from "./components/OrderForm"
import VehicleTypeSelector from "./components/VehicleTypeSelector"
import FindingDriverModal from "./components/FindingDriverModal"
import { Card } from "antd"
import { vehicleService } from "../../features/vehicles/api/vehicleService"
import { orderService } from "../../features/orders/api/orderService"
import { formatCurrency } from "../../utils/formatters"
import useLocalUser from "../../authentication/hooks/useLocalUser"

export default function OrderCreate() {
   const [form] = Form.useForm();
   const navigate = useNavigate();
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);

   // States
   const [loading, setLoading] = useState(false);
   const [vehicles, setVehicles] = useState([]);
   const [filteredVehicles, setFilteredVehicles] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedDistrict, setSelectedDistrict] = useState("all");
   const [selectedType, setSelectedType] = useState(queryParams.get("type") || "all");
   const [selectedWeight, setSelectedWeight] = useState(queryParams.get("weight") || "all");
   const [preSelectedVehicleId, setPreSelectedVehicleId] = useState(queryParams.get("vehicleId") || null);
   const [selectedVehicle, setSelectedVehicle] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [vehicleDetailLoading, setVehicleDetailLoading] = useState(false);
   const [orderItems, setOrderItems] = useState([]);
   const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [imageList, setImageList] = useState([]);
   const [imageUploading, setImageUploading] = useState(false);
   const [createdOrderId, setCreatedOrderId] = useState(null);
   const [findingDrivers, setFindingDrivers] = useState(false);
   const [driverFound, setDriverFound] = useState(false);
   const [driverName, setDriverName] = useState(null);
   const [showFindingModal, setShowFindingModal] = useState(false);
   const user = useLocalUser();
   const socketRef = useRef(null);


   // Tải danh sách xe
   useEffect(() => {
      const fetchVehicles = async () => {
         setLoading(true);
         try {
            const params = {};
            if (selectedType !== "all") params.type = selectedType;
            if (selectedWeight !== "all") params.weightKg = selectedWeight;
            if (selectedDistrict !== "all") params.district = selectedDistrict;
            params.onlineOnly = true;

            const response = await vehicleService.listVehicles(params);
            if (response.data?.success) {
               setVehicles(response.data.data);
               setFilteredVehicles(response.data.data);

               // Tự động chọn xe nếu có vehicleId trong URL
               if (preSelectedVehicleId) {
                  const preSelectedVehicle = response.data.data.find(v => v._id === preSelectedVehicleId);
                  if (preSelectedVehicle) {
                     handleSelectVehicle(preSelectedVehicle);
                     // Scroll to top để hiển thị form đặt hàng
                     setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                     }, 500);
                  }
               }
            } else {
               message.error("Không thể tải danh sách xe");
            }
         } catch (error) {
            console.error("Lỗi khi tải danh sách xe:", error);
            message.error("Lỗi khi tải danh sách xe");
         } finally {
            setLoading(false);
         }
      };

      fetchVehicles();
   }, [selectedType, selectedWeight, selectedDistrict, preSelectedVehicleId]);

   // Lọc xe theo từ khóa tìm kiếm
   useEffect(() => {
      if (!searchTerm.trim()) {
         setFilteredVehicles(vehicles);
         return;
      }

      const filtered = vehicles.filter((vehicle) => {
         const searchLower = searchTerm.toLowerCase();
         const matchesType = vehicle.type?.toLowerCase().includes(searchLower);
         const matchesDriver = vehicle.driverId?.userId?.name?.toLowerCase().includes(searchLower);
         const matchesLicense = vehicle.licensePlate?.toLowerCase().includes(searchLower);

         return matchesType || matchesDriver || matchesLicense;
      });

      setFilteredVehicles(filtered);
   }, [searchTerm, vehicles]);

   // Xử lý mở modal chi tiết xe
   const handleOpenModal = (vehicle) => {
      setSelectedVehicle(vehicle);
      setVehicleDetailLoading(true);
      setIsModalOpen(true);

      // Giả lập tải dữ liệu chi tiết (trong thực tế có thể gọi API)
      setTimeout(() => {
         setVehicleDetailLoading(false);
      }, 500);
   };

   // Xử lý đóng modal
   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedVehicle(null);
   };

   // State để lưu khoảng cách được tính tự động
   const [calculatedDistance, setCalculatedDistance] = useState(null);

   // Xử lý khi khoảng cách thay đổi từ OrderForm
   const handleDistanceChange = (distance) => {
      setCalculatedDistance(distance);
      
      // Cập nhật khoảng cách cho tất cả orderItems nếu có khoảng cách hợp lệ
      if (distance && distance > 0 && orderItems.length > 0) {
         const updatedItems = orderItems.map(item => ({
            ...item,
            distanceKm: distance
         }));
         setOrderItems(updatedItems);
      }
   };

   // Xử lý thêm loại xe vào đơn hàng (không cần chọn xe cụ thể)
   const handleAddVehicleType = (vehicleType, maxWeightKg, pricePerKm) => {
      // Sử dụng khoảng cách đã tính nếu có, nếu không thì dùng mặc định
      const distanceKm = calculatedDistance && calculatedDistance > 0 
         ? calculatedDistance 
         : 10; // Mặc định là 10km

      // Thêm loại xe vào danh sách đặt
      setOrderItems([...orderItems, {
         vehicleId: null, // Không cần vehicleId cụ thể
         vehicleType: vehicleType,
         vehicleInfo: { type: vehicleType, maxWeightKg, pricePerKm }, // Thông tin loại xe
         weightKg: maxWeightKg / 2, // Mặc định là 1/2 trọng tải tối đa
         distanceKm: distanceKm,
         loadingService: false,
         insurance: false
      }]);

      message.success("Đã thêm loại xe vào đơn hàng");
   };

   // Xử lý chọn xe để đặt (giữ lại để tương thích)
   const handleSelectVehicle = (vehicle) => {
      handleAddVehicleType(vehicle.type, vehicle.maxWeightKg, vehicle.pricePerKm);
   };

   // Xử lý xóa xe khỏi đơn hàng
   const handleRemoveVehicle = (index) => {
      const newItems = [...orderItems];
      newItems.splice(index, 1);
      setOrderItems(newItems);
   };

   // Xử lý thay đổi thông tin đơn hàng
   const handleItemChange = (index, field, value) => {
      const newItems = [...orderItems];
      newItems[index][field] = value;
      setOrderItems(newItems);
   };

   // Tính giá đơn hàng
   const calculatePrice = (item) => {
      const { vehicleType, weightKg, distanceKm, loadingService, insurance } = item;

      // Lấy giá cơ bản theo loại xe
      let pricePerKm = 40000; // Mặc định
      if (item.vehicleInfo && item.vehicleInfo.pricePerKm) {
         pricePerKm = item.vehicleInfo.pricePerKm;
      } else {
         // Tính giá theo trọng lượng nếu không có thông tin từ xe
         const ton = weightKg / 1000;
         if (ton <= 1) pricePerKm = 40000;
         else if (ton <= 3) pricePerKm = 60000;
         else if (ton <= 5) pricePerKm = 80000;
         else if (ton <= 10) pricePerKm = 100000;
         else pricePerKm = 150000;
      }

      // Tính giá theo khoảng cách
      const distanceCost = pricePerKm * distanceKm;

      // Phí bốc xếp hàng hóa
      const loadingFee = loadingService ? 50000 : 0;

      // Phí bảo hiểm
      const insuranceFee = insurance ? 100000 : 0;

      // Tổng cộng
      const total = distanceCost + loadingFee + insuranceFee;

      return {
         basePerKm: pricePerKm,
         distanceCost,
         loadingFee,
         insuranceFee,
         total
      };
   };

   // Tính tổng giá đơn hàng
   const calculateTotalPrice = () => {
      return orderItems.reduce((total, item) => {
         const price = calculatePrice(item);
         return total + price.total;
      }, 0);
   };

   // Scroll to top function
   const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

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
         if (payload.orderId === createdOrderId) {
            // Cập nhật popup thành "Đã tìm thấy tài xế"
            setDriverFound(true);
            setDriverName(payload.driverName || 'Tài xế');
            
            // Sau 2 giây, chuyển sang trang đơn hàng và mở chi tiết đơn
            setTimeout(() => {
               setShowFindingModal(false);
               navigate(`/dashboard/orders?orderId=${createdOrderId}&openDetail=true`)
            }, 2000)
         }
      })

      return () => {
         if (socketRef.current) {
            socketRef.current.disconnect()
         }
      }
   }, [createdOrderId, user?._id, navigate])

   // Xử lý tìm tài xế (thay vì submit trực tiếp)
   const handleFindDrivers = async (values) => {
      if (orderItems.length === 0) {
         message.error("Vui lòng chọn ít nhất một loại xe");
         return;
      }

      setFindingDrivers(true);

      try {
         const { 
            pickupAddress, 
            dropoffAddress, 
            customerNote, 
            paymentBy = "sender",
            pickupLat,
            pickupLng,
            dropoffLat,
            dropoffLng,
            loadingService = false,
            insurance = false
         } = values;

         // Validate tọa độ
         if (!pickupLat || !pickupLng) {
            message.error("Vui lòng chọn điểm đón trên bản đồ");
            setFindingDrivers(false);
            return;
         }

         // Chuẩn bị dữ liệu đơn hàng
         const orderData = {
            pickupAddress,
            dropoffAddress,
            customerNote,
            paymentMethod: "Cash",
            paymentBy,
            pickupLocation: {
               type: "Point",
               coordinates: [pickupLng, pickupLat]
            },
            ...(dropoffLat && dropoffLng && {
               dropoffLocation: {
                  type: "Point",
                  coordinates: [dropoffLng, dropoffLat]
               }
            }),
            items: orderItems.map(item => ({
               vehicleType: item.vehicleType,
               vehicleId: item.vehicleId,
               pricePerKm: item.vehicleInfo?.pricePerKm || null,
               weightKg: item.weightKg,
               distanceKm: item.distanceKm,
               loadingService: item.loadingService !== undefined ? item.loadingService : loadingService,
               insurance: item.insurance !== undefined ? item.insurance : insurance,
               itemPhotos: []
            }))
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
            message.error("Lỗi khi tạo đơn hàng: " + (response.data?.message || "Vui lòng thử lại"));
            setFindingDrivers(false);
            setShowFindingModal(false);
         }
      } catch (error) {
         console.error("Lỗi khi tìm tài xế:", error);
         message.error("Lỗi khi tìm tài xế: " + (error.response?.data?.message || error.message || "Vui lòng thử lại"));
         setFindingDrivers(false);
         setShowFindingModal(false);
      }
   };

   return (
      <div className="h-full overflow-auto">
         {/* Order Summary */}
         {orderItems.length > 0 && (
            <OrderSummary
               orderItems={orderItems}
               onRemoveVehicle={handleRemoveVehicle}
               onItemChange={handleItemChange}
               calculatePrice={calculatePrice}
               calculateTotalPrice={calculateTotalPrice}
            />
         )}

         {/* Order Form */}
         {orderItems.length > 0 && (
            <OrderForm
               form={form}
               onSubmit={handleFindDrivers}
               submitting={findingDrivers}
               totalPrice={calculateTotalPrice()}
               formatCurrency={formatCurrency}
               onDistanceChange={handleDistanceChange}
               buttonText={createdOrderId ? "Đang tìm tài xế..." : "Tìm tài xế"}
               disabled={!!createdOrderId}
            />
         )}

         {/* Popup tìm tài xế */}
         <FindingDriverModal
            visible={showFindingModal && !!createdOrderId}
            orderId={createdOrderId}
            driverFound={driverFound}
            driverName={driverName}
         />

         {/* Chọn loại xe - Đơn giản hóa: không cần chọn xe cụ thể */}
         {orderItems.length === 0 && (
            <div className="mb-6">
               <h2 className="text-xl font-semibold mb-4">Chọn loại xe cần vận chuyển</h2>
               <p className="text-gray-600 mb-4">
                  Hệ thống sẽ tự động tìm tài xế gần nhất phù hợp với yêu cầu của bạn
               </p>
               <VehicleTypeSelector onSelectType={handleAddVehicleType} />
            </div>
         )}

         {/* Vehicle Grid - Ẩn đi vì không cần chọn xe cụ thể */}
         {/* <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedWeight={selectedWeight}
            setSelectedWeight={setSelectedWeight}
            filteredVehiclesCount={filteredVehicles.length}
            orderItemsCount={orderItems.length}
            onScrollToTop={handleScrollToTop}
         />

         <VehicleGrid
            vehicles={filteredVehicles}
            loading={loading}
            onViewDetails={handleOpenModal}
            onSelectVehicle={handleSelectVehicle}
            selectedVehicleIds={orderItems.map(item => item.vehicleId)}
         /> */}

         {/* Vehicle Detail Modal */}
         <VehicleDetailModal
            open={isModalOpen}
            onClose={handleCloseModal}
            vehicle={selectedVehicle}
            loading={vehicleDetailLoading}
         />
      </div>
   )
}