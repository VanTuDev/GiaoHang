import React from "react";
import { StarFilled } from "@ant-design/icons";
import { Card, Button } from "antd";
import { formatCurrency } from "../../../utils/formatters";

const VehicleCard = ({
   vehicle,
   onViewDetails,
   onSelectVehicle,
   isSelected = false
}) => {
   return (
      <Card
         hoverable
         cover={
            <img
               src={vehicle.photoUrl || "https://placehold.co/600x400?text=" + vehicle.type}
               alt={vehicle.type}
               className="h-44 w-full object-cover cursor-pointer"
               onClick={() => onViewDetails(vehicle)}
            />
         }
         className={`h-full flex flex-col ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
         <div className="flex-grow">
            <h3 className="text-lg font-semibold">{vehicle.type}</h3>

            {/* Driver Rating */}
            {vehicle.driverId && (
               <div className="flex items-center text-sm mb-2">
                  <StarFilled className="text-yellow-500 mr-1" />
                  {vehicle.driverId.rating || "N/A"}
                  <span className="mx-1">•</span>
                  <span>{vehicle.driverId.totalTrips || 0} chuyến</span>
               </div>
            )}

            {/* Description */}
            <p className="text-gray-600 text-sm mb-2">
               {vehicle.description || `Xe ${vehicle.type} chở hàng`}
            </p>

            {/* Max Weight */}
            <div className="mb-3">
               <span className="text-gray-500 text-sm">Trọng tải tối đa: </span>
               <span className="font-medium">
                  {vehicle.maxWeightKg?.toLocaleString() || "N/A"} kg
               </span>
            </div>

            {/* Price */}
            <div className="mb-3">
               <span className="text-gray-500 text-sm">Giá từ: </span>
               <span className="font-bold text-blue-600">
                  {formatCurrency(vehicle.pricePerKm || 40000)}/km
               </span>
            </div>

            {/* Driver Info */}
            {vehicle.driverId?.userId && (
               <div className="mb-3">
                  <span className="text-gray-500 text-sm">Tài xế: </span>
                  <span className="font-medium">
                     {vehicle.driverId.userId.name || "N/A"}
                  </span>
               </div>
            )}

            {/* License Plate */}
            {vehicle.licensePlate && (
               <div className="mb-3">
                  <span className="text-gray-500 text-sm">Biển số: </span>
                  <span className="font-medium text-green-600">
                     {vehicle.licensePlate}
                  </span>
               </div>
            )}
         </div>

         {/* Action Buttons */}
         <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
            <Button
               className="flex-1"
               onClick={() => onViewDetails(vehicle)}
            >
               Chi tiết
            </Button>
            <Button
               type="primary"
               className="flex-1 bg-blue-600"
               onClick={() => onSelectVehicle(vehicle)}
               disabled={isSelected}
            >
               {isSelected ? "Đã chọn" : "Xem thêm"}
            </Button>
         </div>
      </Card>
   );
};

export default VehicleCard;
