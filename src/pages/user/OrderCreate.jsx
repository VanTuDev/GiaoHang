"use client"

import React, { useState, useEffect } from "react"
import { Form, message } from "antd"
import { useLocation, useNavigate } from "react-router-dom"

import VehicleDetailModal from "./modal/VehicleDetailModal"
import SearchFilters from "./components/SearchFilters"
import VehicleGrid from "./components/VehicleGrid"
import OrderSummary from "./components/OrderSummary"
import OrderForm from "./components/OrderForm"
import { vehicleService } from "../../features/vehicles/api/vehicleService"
import { orderService } from "../../features/orders/api/orderService"
import { formatCurrency } from "../../utils/formatters"

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

   // Xử lý chọn xe để đặt
   const handleSelectVehicle = (vehicle) => {
      // Kiểm tra xem xe đã được chọn chưa
      const exists = orderItems.some(item => item.vehicleId === vehicle._id);

      if (exists) {
         message.warning("Xe này đã được thêm vào đơn hàng");
         return;
      }

      // Thêm xe vào danh sách đặt
      setOrderItems([...orderItems, {
         vehicleId: vehicle._id,
         vehicleType: vehicle.type,
         vehicleInfo: vehicle,
         weightKg: vehicle.maxWeightKg / 2, // Mặc định là 1/2 trọng tải tối đa
         distanceKm: 10, // Mặc định là 10km
         loadingService: false,
         insurance: false
      }]);

      message.success("Đã thêm xe vào đơn hàng");
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

   // Xử lý gửi đơn hàng
   const handleSubmitOrder = async (values) => {
      if (orderItems.length === 0) {
         message.error("Vui lòng chọn ít nhất một xe");
         return;
      }

      setSubmitting(true);

      try {
         const { pickupAddress, dropoffAddress, customerNote } = values;

         // Chuẩn bị dữ liệu đơn hàng
         const orderData = {
            pickupAddress,
            dropoffAddress,
            customerNote,
            paymentMethod: "Cash", // Mặc định là tiền mặt
            items: orderItems.map(item => ({
               vehicleType: item.vehicleType,
               weightKg: item.weightKg,
               distanceKm: item.distanceKm,
               loadingService: item.loadingService,
               insurance: item.insurance,
               itemPhotos: [] // Trong thực tế, bạn sẽ gửi URLs của ảnh đã upload
            }))
         };

         // Gửi đơn hàng
         const response = await orderService.createOrder(orderData);

         if (response.data?.success) {
            message.success("Đặt đơn hàng thành công");
            // Chuyển hướng đến trang danh sách đơn hàng
            navigate("/dashboard/orders");
         } else {
            message.error("Lỗi khi đặt đơn hàng: " + (response.data?.message || "Vui lòng thử lại"));
         }
      } catch (error) {
         console.error("Lỗi khi đặt đơn hàng:", error);
         message.error("Lỗi khi đặt đơn hàng: " + (error.response?.data?.message || error.message || "Vui lòng thử lại"));
      } finally {
         setSubmitting(false);
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
               onSubmit={handleSubmitOrder}
               submitting={submitting}
               totalPrice={calculateTotalPrice()}
               formatCurrency={formatCurrency}
            />
         )}

         {/* Search Filters */}
         <SearchFilters
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

         {/* Vehicle Grid */}
         <VehicleGrid
            vehicles={filteredVehicles}
            loading={loading}
            onViewDetails={handleOpenModal}
            onSelectVehicle={handleSelectVehicle}
            selectedVehicleIds={orderItems.map(item => item.vehicleId)}
         />

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