"use client"

import React, { useState, useEffect } from "react"
import { message } from "antd"

import VehicleDetailModal from "./modal/VehicleDetailModal"
import SearchFilters from "./components/SearchFilters"
import VehicleGrid from "./components/VehicleGrid"
import VehicleStats from "./components/VehicleStats"
import { vehicleService } from "../../features/vehicles/api/vehicleService"
import { orderService } from "../../features/orders/api/orderService"

export default function BookVehicles() {
   // States
   const [loading, setLoading] = useState(false);
   const [vehicles, setVehicles] = useState([]);
   const [filteredVehicles, setFilteredVehicles] = useState([]);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedDistrict, setSelectedDistrict] = useState("all");
   const [selectedType, setSelectedType] = useState("all");
   const [selectedWeight, setSelectedWeight] = useState("all");
   const [selectedVehicle, setSelectedVehicle] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [vehicleDetailLoading, setVehicleDetailLoading] = useState(false);

   // Stats states
   const [stats, setStats] = useState({
      totalVehicles: 0,
      onlineDrivers: 0,
      availableVehicles: 0,
      totalOrders: 0
   });

   // Tải danh sách xe và thống kê
   useEffect(() => {
      const fetchData = async () => {
         setLoading(true);
         try {
            // Fetch vehicles
            const params = {};
            if (selectedType !== "all") params.type = selectedType;
            if (selectedWeight !== "all") params.weightKg = selectedWeight;
            if (selectedDistrict !== "all") params.district = selectedDistrict;
            params.onlineOnly = true;

            const response = await vehicleService.listVehicles(params);
            if (response.data?.success) {
               setVehicles(response.data.data);
               setFilteredVehicles(response.data.data);

               // Calculate stats
               const totalVehicles = response.data.data.length;
               const onlineDrivers = new Set(response.data.data.map(v => v.driverId?._id)).size;
               const availableVehicles = response.data.data.filter(v => v.status === 'Active').length;

               setStats({
                  totalVehicles,
                  onlineDrivers,
                  availableVehicles,
                  totalOrders: 0 // Có thể fetch từ API orders nếu cần
               });
            } else {
               message.error("Không thể tải danh sách xe");
            }
         } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            message.error("Lỗi khi tải dữ liệu");
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [selectedType, selectedWeight, selectedDistrict]);

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

      // Giả lập tải dữ liệu chi tiết
      setTimeout(() => {
         setVehicleDetailLoading(false);
      }, 500);
   };

   // Xử lý đóng modal
   const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedVehicle(null);
   };

   // Xử lý chọn xe để xem chi tiết (không có chức năng đặt hàng ở đây)
   const handleSelectVehicle = (vehicle) => {
      handleOpenModal(vehicle);
   };

   // Scroll to top function
   const handleScrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   return (
      <div className="h-full overflow-auto">
         {/* Vehicle Statistics */}
         <VehicleStats
            totalVehicles={stats.totalVehicles}
            onlineDrivers={stats.onlineDrivers}
            availableVehicles={stats.availableVehicles}
            totalOrders={stats.totalOrders}
         />

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
            orderItemsCount={0} // Không có giỏ hàng ở trang này
            onScrollToTop={handleScrollToTop}
         />

         {/* Vehicle Grid */}
         <VehicleGrid
            vehicles={filteredVehicles}
            loading={loading}
            onViewDetails={handleOpenModal}
            onSelectVehicle={handleSelectVehicle}
            selectedVehicleIds={[]} // Không có xe nào được chọn
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
