import React from "react";
import { Card, Tag } from "antd";
import { formatCurrency } from "../../../utils/formatters";

export default function VehicleTypeCard({ data, onClick }) {
   const { label, type, maxWeightKg, sampleImage, pricePerKm } = data || {};

   return (
      <Card
         hoverable
         cover={
            sampleImage ? (
               <img
                  alt={label || type}
                  src={sampleImage}
                  className="h-40 object-cover w-full"
               />
            ) : (
               <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Không có hình ảnh</span>
               </div>
            )
         }
         onClick={onClick}
         className="h-full flex flex-col"
      >
         <div className="flex-grow">
            <div className="font-semibold text-lg mb-2">{label || type}</div>
            <div className="text-sm text-gray-600 mb-2">
               Tải trọng tối đa: <Tag color="green">{maxWeightKg.toLocaleString()} kg</Tag>
            </div>
            {pricePerKm && (
               <div className="text-sm text-gray-600">
                  Giá từ: <span className="font-semibold text-blue-600">{formatCurrency(pricePerKm)}/km</span>
               </div>
            )}
         </div>
         <div className="mt-3 pt-3 border-t border-gray-100">
            <button
               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded transition"
               onClick={onClick}
            >
               Chọn loại xe này
            </button>
         </div>
      </Card>
   );
}