"use client"

import React, { useState } from "react"
import { Truck, MapPin, BarChart3, ClipboardList, User, Bell } from "lucide-react"

const Overview = () => {
   const [user] = useState({
      name: "Nguyễn Văn Tú",
      role: "Khách hàng",
      location: "Đà Nẵng",
   })

   const features = [
      {
         id: 1,
         title: "Đặt xe nhanh",
         description: "Tìm và đặt xe tải phù hợp chỉ với vài thao tác.",
         icon: <Truck className="h-6 w-6 text-blue-600" />,
      },
      {
         id: 2,
         title: "Quản lý đơn hàng",
         description: "Xem và theo dõi các đơn đặt xe của bạn.",
         icon: <ClipboardList className="h-6 w-6 text-green-600" />,
      },
      {
         id: 3,
         title: "Thống kê chi phí",
         description: "Theo dõi chi phí vận chuyển theo thời gian.",
         icon: <BarChart3 className="h-6 w-6 text-orange-600" />,
      },
      {
         id: 4,
         title: "Thông báo",
         description: "Cập nhật tình trạng đơn hàng và ưu đãi mới.",
         icon: <Bell className="h-6 w-6 text-purple-600" />,
      },
   ]

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Main */}
         <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng bạn đến trang tổng quan</h2>
               <p className="text-gray-600">
                  Hãy chọn chức năng ở bên dưới để bắt đầu quản lý việc đặt xe và vận chuyển.
               </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {features.map((item) => (
                  <div
                     key={item.id}
                     className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                        {item.icon}
                     </div>
                     <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                     <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
               ))}
            </div>
         </main>

      </div>
   )
}

export default Overview
