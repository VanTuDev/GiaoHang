"use client"

import React, { useRef } from "react"
import { Modal, Image, Skeleton, Tag } from "antd"
import {
   CarOutlined,
   PhoneOutlined,
   EnvironmentOutlined,
   StarFilled,
   ClockCircleOutlined,
   DollarCircleOutlined,
   InfoCircleOutlined
} from "@ant-design/icons"

import useOnClickOutside from "../../../authentication/hooks/useOnClickOutside"
import { formatCurrency } from "../../../utils/formatters"

export default function VehicleDetailModal({ open, onClose, vehicle, loading }) {
   const contentRef = useRef(null)
   useOnClickOutside(contentRef, onClose)

   if (!vehicle && !loading) return null

   return (
      <Modal
         open={open}
         onCancel={onClose}
         footer={null}
         title={loading ? "Đang tải thông tin xe..." : `Chi tiết xe - ${vehicle?.label || vehicle?.type}`}
         centered
         width={720}
         maskClosable={false}
         styles={{ body: { maxHeight: '72vh', overflowY: 'auto' } }}
      >
         {loading ? (
            <div className="space-y-4">
               <Skeleton.Image active className="w-full h-64" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <Skeleton active paragraph={{ rows: 4 }} />
                  </div>
                  <div>
                     <Skeleton active paragraph={{ rows: 4 }} />
                  </div>
               </div>
            </div>
         ) : (
            <div ref={contentRef} className="space-y-4">
               {/* Ảnh xe + nhóm preview */}
               <Image.PreviewGroup preview={{ getContainer: () => contentRef.current }}>
                  <Image
                     src={vehicle.sampleImage || vehicle.photoUrl}
                     alt={vehicle.label || vehicle.type}
                     className="w-full h-64 object-cover rounded-lg"
                     style={{ objectFit: 'cover' }}
                     fallback="https://placehold.co/600x400?text=No+Image"
                  />
               </Image.PreviewGroup>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cột trái: mô tả + tính năng */}
                  <div>
                     <h3 className="text-xl font-semibold mb-2">{vehicle.label || vehicle.type}</h3>
                     <p className="text-gray-600 mb-3">{vehicle.description || "Không có mô tả"}</p>
                     <div className="mb-3">
                        <Tag color="blue">{vehicle.type}</Tag>
                        <Tag color="green">Tải trọng: {vehicle.maxWeightKg?.toLocaleString() || "N/A"} kg</Tag>
                     </div>
                     <div>
                        <h4 className="font-medium mb-1">Tính năng:</h4>
                        {Array.isArray(vehicle.features) && vehicle.features.length > 0 ? (
                           <ul className="list-disc list-inside text-gray-600">
                              {vehicle.features.map((f, i) => (
                                 <li key={i}>{f}</li>
                              ))}
                           </ul>
                        ) : (
                           <p className="text-gray-500 italic">Không có thông tin</p>
                        )}
                     </div>
                  </div>

                  {/* Cột phải: tài xế + meta */}
                  <div className="space-y-3">
                     {vehicle.driverId && (
                        <div className="bg-gray-50 rounded-lg p-3">
                           <p className="font-medium">
                              {vehicle.driverId.userId?.name || "Tài xế"}
                           </p>
                           <p className="flex items-center text-gray-600">
                              <PhoneOutlined className="mr-2" /> {vehicle.driverId.userId?.phone || "N/A"}
                           </p>
                           <p className="flex items-center text-gray-600">
                              <StarFilled className="mr-2 text-yellow-500" /> {vehicle.driverId.rating || "N/A"}
                              <span className="ml-2">({vehicle.driverId.totalTrips || 0} chuyến)</span>
                           </p>
                        </div>
                     )}

                     {Array.isArray(vehicle.driverId?.serviceAreas) && vehicle.driverId.serviceAreas.length > 0 && (
                        <div className="flex items-start text-gray-600">
                           <EnvironmentOutlined className="mr-2 mt-0.5" />
                           <div className="flex flex-wrap gap-2">
                              {vehicle.driverId.serviceAreas.map((d, i) => (
                                 <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{d}</span>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="flex items-center text-gray-700">
                        <DollarCircleOutlined className="mr-2" />
                        <div>
                           <span className="text-gray-500">Giá từ: </span>
                           <span className="font-bold text-blue-600">
                              {formatCurrency(vehicle.pricePerKm || 0)}/km
                           </span>
                        </div>
                     </div>

                     <div className="mt-4">
                        <button
                           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                           onClick={() => {
                              onClose();
                              window.location.href = `/dashboard/book?type=${encodeURIComponent(vehicle.type)}&weight=${vehicle.maxWeightKg}`;
                           }}
                        >
                           Đặt xe này
                        </button>
                     </div>
                  </div>
               </div>

               {/* Thông tin thêm */}
               <div className="bg-blue-50 p-3 rounded-lg mt-4">
                  <div className="flex items-start">
                     <InfoCircleOutlined className="text-blue-600 mr-2 mt-1" />
                     <div>
                        <p className="text-sm text-gray-700">
                           Giá cước được tính dựa trên khối lượng hàng hóa và quãng đường di chuyển.
                           Có thể phát sinh thêm phí bốc xếp hàng hóa và phí bảo hiểm nếu bạn yêu cầu.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </Modal>
   )
}