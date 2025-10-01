import React from "react";
import { CarOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import VehicleCard from "./VehicleCard";

const VehicleGrid = ({
   vehicles,
   loading,
   onViewDetails,
   onSelectVehicle,
   selectedVehicleIds = []
}) => {
   if (loading) {
      return (
         <div className="flex justify-center items-center py-20">
            <Spin size="large" />
            <span className="ml-2">Đang tải danh sách xe...</span>
         </div>
      );
   }

   if (vehicles.length === 0) {
      return (
         <div className="text-center py-12">
            <CarOutlined className="text-gray-400 text-5xl mb-2" />
            <h3 className="text-lg font-semibold mb-1">Không tìm thấy xe phù hợp</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {vehicles.map((vehicle) => (
            <VehicleCard
               key={vehicle._id}
               vehicle={vehicle}
               onViewDetails={onViewDetails}
               onSelectVehicle={onSelectVehicle}
               isSelected={selectedVehicleIds.includes(vehicle._id)}
            />
         ))}
      </div>
   );
};

export default VehicleGrid;
