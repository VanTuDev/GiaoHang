"use client"

import React, { useState } from "react"
import {
   SearchOutlined,
   CarOutlined,
   PhoneOutlined,
   EnvironmentOutlined,
   StarFilled,
   ClockCircleOutlined,
} from "@ant-design/icons"

import VehicleDetailModal from "../user/modal/VehicleDetailModal"  // import modal


// Mock data
const vehicleData = [
   {
      id: 1,
      name: "Xe máy",
      type: "motorcycle",
      maxWeight: "0 - 80kg",
      pricePerKm: 15000,
      image: "/imgs/logonen.png",
      description: "Giao hàng nhanh, tiết kiệm chi phí",
      features: ["Giao hàng nhanh", "Tiết kiệm", "Linh hoạt"],
      rating: 4.3,
      reviewCount: 132,
      comments: [
         {
            userName: "Lâm N.",
            content: "Tài xế thân thiện, giao rất đúng giờ.",
            rating: 5,
            time: "2 ngày trước",
            images: ["/imgs/logonen.png"]
         },
         {
            userName: "Hải T.",
            content: "Giá hợp lý, sẽ ủng hộ tiếp.",
            rating: 4,
            time: "1 tuần trước",
            images: ["/imgs/logonen.png", "/imgs/logonen.png"]
         }
      ],
      available: true,
      districts: ["Hải Châu", "Cẩm Lệ"],
      driverName: "Nguyễn Văn A",
      driverPhone: "0901234567",
      estimatedTime: "15 phút",
   },
   {
      id: 2,
      name: "Xe máy",
      type: "motorcycle",
      maxWeight: "0 - 80kg",
      pricePerKm: 15000,
      image: "/imgs/logonen.png",
      description: "Giao hàng nhanh, tiết kiệm chi phí",
      features: ["Giao hàng nhanh", "Tiết kiệm", "Linh hoạt"],
      rating: 4.5,
      reviewCount: 89,
      comments: [
         {
            userName: "Thu H.",
            content: "Đi đường cẩn thận, đóng gói kỹ.",
            rating: 5,
            time: "3 ngày trước",
            images: ["/imgs/logonen.png"]
         }
      ],
      available: true,
      districts: ["Sơn Trà", "FPT"],
      driverName: "Trần Thị B",
      driverPhone: "0901234568",
      estimatedTime: "20 phút",
   },
   {
      id: 3,
      name: "Xe ô tô",
      type: "car",
      maxWeight: "200 - 500kg",
      pricePerKm: 25000,
      image: "/imgs/logonen.png",
      description: "Phù hợp cho hàng hóa nhỏ, an toàn",
      features: ["Bảo vệ hàng hóa", "Thoải mái", "An toàn"],
      rating: 4.4,
      reviewCount: 64,
      comments: [
         {
            userName: "Minh K.",
            content: "Xe sạch sẽ, hàng đến nguyên vẹn.",
            rating: 4,
            time: "5 ngày trước",
            images: ["/imgs/logonen.png"]
         }
      ],
      available: true,
      districts: ["Ngũ Hành Sơn", "Sơn Trà"],
      driverName: "Lê Văn C",
      driverPhone: "0901234569",
      estimatedTime: "25 phút",
   },
]
const districts = ["Tất cả quận", "Hải Châu", "Sơn Trà", "Ngũ Hành Sơn", "Cẩm Lệ", "FPT"]

export default function OrderCreate() {
   const [searchTerm, setSearchTerm] = useState("")
   const [selectedDistrict, setSelectedDistrict] = useState("Tất cả quận")
   const [selectedType, setSelectedType] = useState("all")
   const [selectedWeight, setSelectedWeight] = useState("all")
   const [selectedVehicle, setSelectedVehicle] = useState(null)
   const [isModalOpen, setIsModalOpen] = useState(false)


   const handleOpenModal = (vehicle) => {
      setSelectedVehicle(vehicle)
      setIsModalOpen(true)
   }

   const handleCloseModal = () => {
      setIsModalOpen(false)
      setSelectedVehicle(null)
   }

   const filteredVehicles = vehicleData.filter((vehicle) => {
      const matchesSearch =
         vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         vehicle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (Array.isArray(vehicle.districts) ? vehicle.districts.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) : false)

      const matchesDistrict =
         selectedDistrict === "Tất cả quận" || (Array.isArray(vehicle.districts) && vehicle.districts.includes(selectedDistrict))
      const matchesType = selectedType === "all" || vehicle.type === selectedType
      const matchesWeight =
         selectedWeight === "all" || vehicle.maxWeight.includes(selectedWeight)

      return matchesSearch && matchesDistrict && matchesType && matchesWeight
   })

   const formatPrice = (price) =>
      new Intl.NumberFormat("vi-VN", {
         style: "currency",
         currency: "VND",
      }).format(price)

   return (
      <div className="h-full overflow-auto">
         {/* Filters sticky */}
         <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-3">
               <div className="flex items-center border rounded px-2">
                  <SearchOutlined className="text-gray-400 mr-2" />
                  <input
                     type="text"
                     placeholder="Tìm xe, quận..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full outline-none py-1"
                  />
               </div>
               <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="border rounded px-3 py-2">
                  {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
               </select>
               <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="border rounded px-3 py-2">
                  <option value="all">Tất cả xe</option>
                  <option value="motorcycle">Xe máy</option>
                  <option value="car">Ô tô</option>
                  <option value="small_truck">Tải nhỏ</option>
                  <option value="medium_truck">Tải vừa</option>
                  <option value="large_truck">Tải lớn</option>
                  <option value="box_truck">Thùng kín</option>
               </select>
               <select value={selectedWeight} onChange={(e) => setSelectedWeight(e.target.value)} className="border rounded px-3 py-2">
                  <option value="all">Tất cả trọng tải</option>
                  <option value="80kg">0 - 80kg</option>
                  <option value="500kg">200 - 500kg</option>
                  <option value="1 tấn">500kg - 1 tấn</option>
                  <option value="3 tấn">1 - 3 tấn</option>
                  <option value="8 tấn">3 - 8 tấn</option>
               </select>
               <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition">
                  Lọc ({filteredVehicles.length})
               </button>
            </div>
         </div>

         {/* Vehicle Grid */}
         <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => (
               //card vehicle
               <div key={vehicle.id} className="bg-red-200 rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <img src={vehicle.image} alt={vehicle.name} className="h-44 w-full object-cover cursor-pointer" onClick={() => handleOpenModal(vehicle)} />
                  <div className="p-4">
                     <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                     <span className="inline-flex items-center text-blue-600 text-sm mb-2">
                        <EnvironmentOutlined className="mr-1" />
                        {Array.isArray(vehicle.districts) && vehicle.districts.length > 0 ? (
                           <>
                              {vehicle.districts[0]}
                              {vehicle.districts.length > 1 ? <span className="text-gray-500 ml-1">+{vehicle.districts.length - 1}</span> : null}
                           </>
                        ) : '—'}
                     </span>
                     <p className="text-gray-600 text-sm mb-2">{vehicle.description}</p>
                     <div className="flex items-center text-yellow-500 mb-2">
                        <StarFilled className="mr-1" /> {vehicle.rating}
                     </div>
                     <div className="mb-3">
                        <span className="text-gray-500 text-sm">Giá từ:</span>{" "}
                        <span className="font-bold text-blue-600">{formatPrice(vehicle.pricePerKm)}/km</span>
                     </div>
                     <button
                        disabled={!vehicle.available}
                        className={`w-full py-2 rounded text-white ${vehicle.available ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                     >
                        {vehicle.available ? "Chọn xe này" : "Hết xe"}
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {filteredVehicles.length === 0 && (
            <div className="text-center py-12">
               <CarOutlined className="text-gray-400 text-5xl mb-2" />
               <h3 className="text-lg font-semibold mb-1">Không tìm thấy xe phù hợp</h3>
               <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
         )}
         <VehicleDetailModal open={isModalOpen} onClose={handleCloseModal} vehicle={selectedVehicle} />
      </div>
   )
}
