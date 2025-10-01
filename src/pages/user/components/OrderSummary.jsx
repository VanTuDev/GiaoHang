import React from "react";
import { Card, Button, Checkbox, InputNumber, Divider } from "antd";
import { formatCurrency } from "../../../utils/formatters";

const OrderSummary = ({
   orderItems,
   onRemoveVehicle,
   onItemChange,
   calculatePrice,
   calculateTotalPrice
}) => {
   return (
      <div className="mb-6">
         <Card title="Thông tin đơn hàng" className="shadow-sm">
            <Divider>Danh sách xe đã chọn</Divider>

            {orderItems.map((item, index) => (
               <Card
                  key={index}
                  className="mb-4 border border-blue-100"
                  extra={
                     <Button
                        danger
                        onClick={() => onRemoveVehicle(index)}
                     >
                        Xóa
                     </Button>
                  }
               >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Vehicle Info */}
                     <div>
                        <p className="font-medium">{item.vehicleInfo?.type || item.vehicleType}</p>
                        <p className="text-gray-500">
                           {item.vehicleInfo?.licensePlate || "Chưa có biển số"}
                        </p>

                        {/* Weight Input */}
                        <div className="mt-3">
                           <div className="mb-2">
                              <label className="text-sm text-gray-600">Khối lượng hàng (kg):</label>
                              <InputNumber
                                 min={1}
                                 max={item.vehicleInfo?.maxWeightKg || 10000}
                                 value={item.weightKg}
                                 onChange={(value) => onItemChange(index, "weightKg", value)}
                                 className="ml-2"
                              />
                           </div>

                           {/* Distance Input */}
                           <div className="mb-2">
                              <label className="text-sm text-gray-600">Khoảng cách (km):</label>
                              <InputNumber
                                 min={1}
                                 value={item.distanceKm}
                                 onChange={(value) => onItemChange(index, "distanceKm", value)}
                                 className="ml-2"
                              />
                           </div>
                        </div>
                     </div>

                     {/* Services & Pricing */}
                     <div>
                        {/* Loading Service */}
                        <div className="mb-2">
                           <Checkbox
                              checked={item.loadingService}
                              onChange={(e) => onItemChange(index, "loadingService", e.target.checked)}
                           >
                              Dịch vụ bốc xếp hàng (+50,000đ)
                           </Checkbox>
                        </div>

                        {/* Insurance */}
                        <div className="mb-4">
                           <Checkbox
                              checked={item.insurance}
                              onChange={(e) => onItemChange(index, "insurance", e.target.checked)}
                           >
                              <div>
                                 <div className="font-medium">Bảo hiểm hàng hóa (+100,000đ)</div>
                                 <div className="text-xs text-gray-500">
                                    Bảo hiểm toàn bộ hàng hóa trong quá trình vận chuyển
                                 </div>
                              </div>
                           </Checkbox>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 p-3 rounded">
                           <p className="font-medium">Chi phí:</p>
                           <p>Cước phí: {formatCurrency(calculatePrice(item).distanceCost)}</p>
                           {item.loadingService && (
                              <p>Phí bốc xếp: {formatCurrency(calculatePrice(item).loadingFee)}</p>
                           )}
                           {item.insurance && (
                              <p>Phí bảo hiểm: {formatCurrency(calculatePrice(item).insuranceFee)}</p>
                           )}
                           <p className="font-bold text-blue-600">
                              Tổng: {formatCurrency(calculatePrice(item).total)}
                           </p>
                        </div>
                     </div>
                  </div>
               </Card>
            ))}

            {/* Total Price */}
            <div className="flex justify-between items-center mt-4">
               <div className="text-lg">
                  <span className="font-medium">Tổng cộng: </span>
                  <span className="font-bold text-blue-600">
                     {formatCurrency(calculateTotalPrice())}
                  </span>
               </div>
            </div>
         </Card>
      </div>
   );
};

export default OrderSummary;
