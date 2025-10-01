import React, { useState } from "react";
import { Card, Tag, Switch, Button, message, Tooltip } from "antd";
import {
   CarOutlined,
   DollarCircleOutlined,
   SafetyOutlined,
   InfoCircleOutlined,
   CheckCircleOutlined,
   ClockCircleOutlined,
   CloseCircleOutlined
} from "@ant-design/icons";
import { formatCurrency } from "../../../utils/formatters";

const OrderItemCard = ({
   item,
   orderStatus,
   onUpdateInsurance,
   onCancelItem,
   canModify = true
}) => {
   const [updating, setUpdating] = useState(false);

   const getStatusColor = (status) => {
      const colors = {
         'Created': 'blue',
         'Accepted': 'orange',
         'PickedUp': 'purple',
         'Delivering': 'cyan',
         'Delivered': 'green',
         'Cancelled': 'red'
      };
      return colors[status] || 'default';
   };

   const getStatusIcon = (status) => {
      const icons = {
         'Created': <ClockCircleOutlined />,
         'Accepted': <CheckCircleOutlined />,
         'PickedUp': <CarOutlined />,
         'Delivering': <CarOutlined />,
         'Delivered': <CheckCircleOutlined />,
         'Cancelled': <CloseCircleOutlined />
      };
      return icons[status] || <InfoCircleOutlined />;
   };

   const getStatusText = (status) => {
      const texts = {
         'Created': 'Chờ tài xế nhận',
         'Accepted': 'Tài xế đã nhận',
         'PickedUp': 'Đã lấy hàng',
         'Delivering': 'Đang giao hàng',
         'Delivered': 'Đã giao hàng',
         'Cancelled': 'Đã huỷ'
      };
      return texts[status] || status;
   };

   const handleInsuranceChange = async (checked) => {
      if (!canModify || orderStatus !== 'Created') {
         message.warning('Không thể thay đổi bảo hiểm khi đơn hàng đã được xử lý');
         return;
      }

      setUpdating(true);
      try {
         await onUpdateInsurance(item._id, checked);
         message.success(checked ? 'Đã bật bảo hiểm' : 'Đã tắt bảo hiểm');
      } catch (error) {
         message.error('Có lỗi xảy ra khi cập nhật bảo hiểm');
      } finally {
         setUpdating(false);
      }
   };

   const canModifyInsurance = canModify && orderStatus === 'Created' && item.status === 'Created';

   return (
      <Card
         className="mb-4"
         title={
            <div className="flex items-center justify-between">
               <div className="flex items-center">
                  <CarOutlined className="mr-2" />
                  <span className="font-medium">{item.vehicleType}</span>
               </div>
               <Tag
                  color={getStatusColor(item.status)}
                  icon={getStatusIcon(item.status)}
                  className="text-sm"
               >
                  {getStatusText(item.status)}
               </Tag>
            </div>
         }
         extra={
            item.driverId && (
               <div className="text-sm text-gray-600">
                  Tài xế: {item.driverId.userId?.name || 'N/A'}
               </div>
            )
         }
      >
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thông tin cơ bản */}
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-gray-600">Khối lượng:</span>
                  <span className="font-medium">{item.weightKg?.toLocaleString()} kg</span>
               </div>

               <div className="flex items-center justify-between">
                  <span className="text-gray-600">Khoảng cách:</span>
                  <span className="font-medium">{item.distanceKm} km</span>
               </div>

               <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dịch vụ bốc xếp:</span>
                  <Tag color={item.loadingService ? 'green' : 'default'}>
                     {item.loadingService ? 'Có' : 'Không'}
                  </Tag>
               </div>

               <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bảo hiểm:</span>
                  <div className="flex items-center">
                     {canModifyInsurance ? (
                        <Switch
                           checked={item.insurance}
                           onChange={handleInsuranceChange}
                           loading={updating}
                           checkedChildren="Có"
                           unCheckedChildren="Không"
                        />
                     ) : (
                        <Tag color={item.insurance ? 'green' : 'default'}>
                           {item.insurance ? 'Có' : 'Không'}
                        </Tag>
                     )}
                  </div>
               </div>
            </div>

            {/* Chi phí */}
            <div className="space-y-3">
               <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium mb-2 flex items-center">
                     <DollarCircleOutlined className="mr-1" />
                     Chi phí chi tiết
                  </h5>

                  {item.priceBreakdown && (
                     <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                           <span>Cước phí:</span>
                           <span>{formatCurrency(item.priceBreakdown.distanceCost || 0)}</span>
                        </div>

                        {item.loadingService && (
                           <div className="flex justify-between">
                              <span>Phí bốc xếp:</span>
                              <span>{formatCurrency(item.priceBreakdown.loadCost || 0)}</span>
                           </div>
                        )}

                        {item.insurance && (
                           <div className="flex justify-between">
                              <span>Phí bảo hiểm:</span>
                              <span>{formatCurrency(item.priceBreakdown.insuranceFee || 0)}</span>
                           </div>
                        )}

                        <div className="flex justify-between font-bold text-blue-600 border-t pt-1">
                           <span>Tổng:</span>
                           <span>{formatCurrency(item.priceBreakdown.total || 0)}</span>
                        </div>
                     </div>
                  )}
               </div>

               {/* Thông tin thời gian */}
               {item.acceptedAt && (
                  <div className="text-xs text-gray-500">
                     <p>Tài xế nhận: {new Date(item.acceptedAt).toLocaleString()}</p>
                  </div>
               )}

               {item.pickedUpAt && (
                  <div className="text-xs text-gray-500">
                     <p>Lấy hàng: {new Date(item.pickedUpAt).toLocaleString()}</p>
                  </div>
               )}

               {item.deliveredAt && (
                  <div className="text-xs text-gray-500">
                     <p>Giao hàng: {new Date(item.deliveredAt).toLocaleString()}</p>
                  </div>
               )}

               {item.cancelledAt && (
                  <div className="text-xs text-red-500">
                     <p>Huỷ lúc: {new Date(item.cancelledAt).toLocaleString()}</p>
                     {item.cancelReason && (
                        <p>Lý do: {item.cancelReason}</p>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Tooltip cho bảo hiểm */}
         {!canModifyInsurance && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
               <InfoCircleOutlined className="mr-1" />
               {orderStatus !== 'Created'
                  ? 'Không thể thay đổi bảo hiểm khi đơn hàng đã được xử lý'
                  : 'Không thể thay đổi bảo hiểm khi item đã được tài xế nhận'
               }
            </div>
         )}
      </Card>
   );
};

export default OrderItemCard;
