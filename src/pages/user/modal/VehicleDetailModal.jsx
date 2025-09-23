"use client"

import React, { useRef } from "react"
import { Modal, Image } from "antd"
import {
   CarOutlined,
   PhoneOutlined,
   EnvironmentOutlined,
   StarFilled,
   ClockCircleOutlined,
} from "@ant-design/icons"

import useOnClickOutside from "../../../authentication/hooks/useOnClickOutside"

export default function VehicleDetailModal({ open, onClose, vehicle }) {
   if (!vehicle) return null

   const contentRef = useRef(null)
   useOnClickOutside(contentRef, onClose)

   return (
      <Modal
         open={open}
         onCancel={onClose}
         footer={null}
         title={`Chi tiết xe - ${vehicle.name}`}
         centered
         width={720}
         maskClosable={false}
         styles={{ body: { maxHeight: '72vh', overflowY: 'auto' } }}
      >
         <div ref={contentRef} className="space-y-4">
            {/* Ảnh xe + nhóm preview */}
            <Image.PreviewGroup preview={{ getContainer: () => contentRef.current }}>
               <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-64 object-cover rounded-lg"
                  style={{ objectFit: 'cover' }}
               />
            </Image.PreviewGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Cột trái: mô tả + tính năng */}
               <div>
                  <h3 className="text-xl font-semibold mb-2">{vehicle.name}</h3>
                  <p className="text-gray-600 mb-3">{vehicle.description}</p>
                  <div>
                     <h4 className="font-medium mb-1">Tính năng:</h4>
                     <ul className="list-disc list-inside text-gray-600">
                        {vehicle.features.map((f, i) => (
                           <li key={i}>{f}</li>
                        ))}
                     </ul>
                  </div>
               </div>

               {/* Cột phải: tài xế + meta */}
               <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                     <p className="font-medium">{vehicle.driverName}</p>
                     <p className="flex items-center text-gray-600">
                        <PhoneOutlined className="mr-2" /> {vehicle.driverPhone}
                     </p>
                     <p className="flex items-center text-gray-600">
                        <ClockCircleOutlined className="mr-2" /> {vehicle.estimatedTime}
                     </p>
                  </div>
                  <div className="flex items-start text-gray-600">
                     <EnvironmentOutlined className="mr-2 mt-0.5" />
                     <div className="flex flex-wrap gap-2">
                        {Array.isArray(vehicle.districts) && vehicle.districts.length > 0 ? (
                           vehicle.districts.map((d, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs">{d}</span>
                           ))
                        ) : (
                           <span>—</span>
                        )}
                     </div>
                  </div>
                  <div className="flex items-center text-yellow-500">
                     <StarFilled className="mr-1" /> {vehicle.rating}
                     <span className="ml-2 text-gray-500 text-sm">({vehicle.reviewCount || 0} lượt đánh giá)</span>
                  </div>
                  <div>
                     <span className="text-gray-500">Giá từ: </span>
                     <span className="font-bold text-blue-600">
                        {vehicle.pricePerKm.toLocaleString("vi-VN")}đ / km
                     </span>
                  </div>
               </div>
            </div>

            {/* Comments */}
            {Array.isArray(vehicle.comments) && vehicle.comments.length > 0 ? (
               <div>
                  <h4 className="font-medium mb-2">Nhận xét</h4>
                  <div className="space-y-3">
                     {vehicle.comments.map((c, idx) => (
                        <div key={idx} className="border rounded-md p-3">
                           <div className="flex items-center justify-between">
                              <div className="font-medium">{c.userName}</div>
                              <div className="flex items-center text-yellow-500 text-sm">
                                 <StarFilled className="mr-1" /> {c.rating}
                                 <span className="ml-2 text-gray-500">{c.time}</span>
                              </div>
                           </div>
                           <p className="text-gray-700 mt-1">{c.content}</p>
                           {Array.isArray(c.images) && c.images.length > 0 ? (
                              <div className="mt-2 grid grid-cols-3 gap-2">
                                 <Image.PreviewGroup preview={{ getContainer: () => contentRef.current }}>
                                    {c.images.map((img, i) => (
                                       <Image key={i} src={img} alt="review" className="h-20 w-full object-cover rounded cursor-pointer" style={{ objectFit: 'cover' }} />
                                    ))}
                                 </Image.PreviewGroup>
                              </div>
                           ) : null}
                        </div>
                     ))}
                  </div>
               </div>
            ) : null}
         </div>
      </Modal>
   )
}
