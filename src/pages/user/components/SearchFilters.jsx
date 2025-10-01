import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Select, Button } from "antd";

const SearchFilters = ({
   searchTerm,
   setSearchTerm,
   selectedDistrict,
   setSelectedDistrict,
   selectedType,
   setSelectedType,
   selectedWeight,
   setSelectedWeight,
   filteredVehiclesCount,
   orderItemsCount,
   onScrollToTop
}) => {
   // Danh sách quận/huyện
   const districts = [
      "Tất cả quận",
      "Quận Cẩm Lệ",
      "Quận Hải Châu",
      "Quận Liên Chiểu",
      "Quận Ngũ Hành Sơn",
      "Quận Sơn Trà",
      "Quận Thanh Khê",
      "Huyện Hòa Vang",
      "Huyện Hoàng Sa"
   ];

   const vehicleTypes = [
      { value: "all", label: "Tất cả xe" },
      { value: "TruckSmall", label: "Xe tải nhỏ" },
      { value: "TruckMedium", label: "Xe tải vừa" },
      { value: "TruckLarge", label: "Xe tải lớn" },
      { value: "TruckBox", label: "Xe thùng" },
      { value: "DumpTruck", label: "Xe ben" },
      { value: "PickupTruck", label: "Xe bán tải" },
      { value: "Trailer", label: "Xe kéo" }
   ];

   const weightRanges = [
      { value: "all", label: "Tất cả trọng tải" },
      { value: "500", label: "0 - 500kg" },
      { value: "1000", label: "0 - 1 tấn" },
      { value: "3000", label: "0 - 3 tấn" },
      { value: "5000", label: "0 - 5 tấn" },
      { value: "10000", label: "0 - 10 tấn" }
   ];

   return (
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
         <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Search Input */}
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

            {/* District Filter */}
            <Select
               value={selectedDistrict}
               onChange={setSelectedDistrict}
               className="w-full"
               options={districts.map((d) => ({
                  value: d === "Tất cả quận" ? "all" : d,
                  label: d
               }))}
            />

            {/* Vehicle Type Filter */}
            <Select
               value={selectedType}
               onChange={setSelectedType}
               className="w-full"
               options={vehicleTypes}
            />

            {/* Weight Filter */}
            <Select
               value={selectedWeight}
               onChange={setSelectedWeight}
               className="w-full"
               options={weightRanges}
            />

            {/* Results Count & Cart Button */}
            <div className="flex items-center justify-between gap-2">
               <span className="text-gray-500">
                  {filteredVehiclesCount} xe
               </span>
               {orderItemsCount > 0 && (
                  <Button
                     type="primary"
                     onClick={onScrollToTop}
                     className="bg-blue-600"
                  >
                     Xem giỏ hàng ({orderItemsCount})
                  </Button>
               )}
            </div>
         </div>
      </div>
   );
};

export default SearchFilters;
