"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, Steps, Tag, Button, Avatar, Space, Spin, message } from "antd"
import { 
   EnvironmentOutlined, 
   PhoneOutlined, 
   UserOutlined,
   ClockCircleOutlined,
   CheckCircleOutlined,
   TruckOutlined,
   CarOutlined,
   StarOutlined
} from "@ant-design/icons"
import { useParams, useNavigate } from "react-router-dom"
import { orderService } from "../../features/orders/api/orderService"
import { formatCurrency, formatDate } from "../../utils/formatters"
import { io } from 'socket.io-client'
import useLocalUser from "../../authentication/hooks/useLocalUser"

const { Step } = Steps

export default function OrderTracking() {
   const { orderId } = useParams()
   const navigate = useNavigate()
   const user = useLocalUser()
   const socketRef = useRef(null)
   
   const [order, setOrder] = useState(null)
   const [loading, setLoading] = useState(true)
   const [driverLocation, setDriverLocation] = useState(null)

   // Load order data
   useEffect(() => {
      const fetchOrder = async () => {
         try {
            const response = await orderService.getOrderDetail(orderId)
            if (response.data?.success) {
               setOrder(response.data.data)
            } else {
               message.error("Không tìm thấy đơn hàng")
               navigate("/dashboard/orders")
            }
         } catch (error) {
            console.error("Lỗi khi tải đơn hàng:", error)
            message.error("Lỗi khi tải đơn hàng")
            navigate("/dashboard/orders")
         } finally {
            setLoading(false)
         }
      }

      if (orderId) {
         fetchOrder()
      }
   }, [orderId, navigate])

   // Setup Socket.IO để nhận updates realtime
   useEffect(() => {
      if (!orderId || !user?._id) return

      let SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080'
      
      if (import.meta.env.DEV && typeof window !== 'undefined') {
         const currentHost = window.location.hostname
         if (currentHost !== 'localhost' && currentHost !== '127.0.0.1' && SOCKET_URL.includes('localhost')) {
            SOCKET_URL = SOCKET_URL.replace('localhost', currentHost).replace('127.0.0.1', currentHost)
         }
      }

      const socket = io(SOCKET_URL, { transports: ['websocket'], withCredentials: false })
      socketRef.current = socket

      socket.on('connect', () => {
         // Join room cho customer
         socket.emit('customer:join', user._id)
         console.log('✅ Customer đã join room')
      })

      // Lắng nghe khi tài xế nhận đơn
      socket.on('order:accepted', (payload) => {
         console.log('📨 Nhận được order:accepted:', payload)
         if (payload.orderId === orderId) {
            message.success(`Tài xế ${payload.driverName} đã nhận đơn của bạn!`)
            // Refetch order để cập nhật thông tin
            orderService.getOrderDetail(orderId).then(response => {
               if (response.data?.success) {
                  setOrder(response.data.data)
               }
            })
         }
      })

      // Lắng nghe khi tài xế cập nhật trạng thái
      socket.on('order:status:updated', (payload) => {
         console.log('📨 Nhận được order:status:updated:', payload)
         if (payload.orderId === orderId) {
            message.info(`Đơn hàng: ${getStatusText(payload.status)}`)
            // Refetch order
            orderService.getOrderDetail(orderId).then(response => {
               if (response.data?.success) {
                  setOrder(response.data.data)
               }
            })
         }
      })

      return () => {
         socket.disconnect()
      }
   }, [orderId, user?._id])

   const getStatusText = (status) => {
      const statusMap = {
         'Created': 'Đang tìm tài xế',
         'Accepted': 'Tài xế đã nhận đơn',
         'PickedUp': 'Đã lấy hàng',
         'Delivering': 'Đang giao hàng',
         'Delivered': 'Đã giao hàng',
         'Cancelled': 'Đã hủy'
      }
      return statusMap[status] || status
   }

   const getStatusColor = (status) => {
      const colorMap = {
         'Created': 'gold',
         'Accepted': 'blue',
         'PickedUp': 'purple',
         'Delivering': 'orange',
         'Delivered': 'green',
         'Cancelled': 'red'
      }
      return colorMap[status] || 'default'
   }

   const getCurrentStep = (itemStatus) => {
      switch (itemStatus) {
         case 'Accepted':
            return 0
         case 'PickedUp':
            return 1
         case 'Delivering':
            return 2
         case 'Delivered':
            return 3
         default:
            return 0
      }
   }

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <Spin size="large" />
         </div>
      )
   }

   if (!order) {
      return null
   }

   const activeItem = order.items?.find(item => item.driverId) || order.items?.[0]
   const driver = activeItem?.driverId

   return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
         <Card className="mb-4">
            <div className="flex items-center justify-between mb-4">
               <h1 className="text-2xl font-bold">Theo dõi đơn hàng</h1>
               <Button onClick={() => navigate("/dashboard/orders")}>Quay lại</Button>
            </div>
            
            <div className="mb-4">
               <Tag color="blue">Mã đơn: #{order._id.substring(0, 8).toUpperCase()}</Tag>
               <Tag color="green">Tổng tiền: {formatCurrency(order.totalPrice)}</Tag>
            </div>
         </Card>

         {/* Địa chỉ */}
         <Card className="mb-4" title="Thông tin đơn hàng">
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                  <EnvironmentOutlined className="text-green-500 text-xl mt-1" />
                  <div>
                     <div className="font-semibold text-green-600">Điểm đón</div>
                     <div>{order.pickupAddress}</div>
                  </div>
               </div>
               <div className="flex items-start gap-3">
                  <EnvironmentOutlined className="text-red-500 text-xl mt-1" />
                  <div>
                     <div className="font-semibold text-red-600">Điểm đến</div>
                     <div>{order.dropoffAddress}</div>
                  </div>
               </div>
            </div>
         </Card>

         {/* Tiến trình đơn hàng */}
         {activeItem && (
            <Card className="mb-4" title="Tiến trình đơn hàng">
               <Steps current={getCurrentStep(activeItem.status)} className="mb-6">
                  <Step 
                     title="Tài xế đã nhận đơn" 
                     description={activeItem.acceptedAt ? formatDate(activeItem.acceptedAt, true) : ''}
                     icon={<UserOutlined />}
                  />
                  <Step 
                     title="Đã lấy hàng" 
                     description={activeItem.pickedUpAt ? formatDate(activeItem.pickedUpAt, true) : ''}
                     icon={<CarOutlined />}
                  />
                  <Step 
                     title="Đang giao hàng" 
                     icon={<TruckOutlined />}
                  />
                  <Step 
                     title="Đã giao hàng" 
                     description={activeItem.deliveredAt ? formatDate(activeItem.deliveredAt, true) : ''}
                     icon={<CheckCircleOutlined />}
                  />
               </Steps>

               <div className="mt-4">
                  <Tag color={getStatusColor(activeItem.status)} className="text-lg px-4 py-2">
                     {getStatusText(activeItem.status)}
                  </Tag>
               </div>
            </Card>
         )}

         {/* Thông tin tài xế */}
         {driver && (
            <Card title="Thông tin tài xế">
               <div className="flex items-center gap-4">
                  <Avatar size={64} icon={<UserOutlined />} src={driver.userId?.avatarUrl} />
                  <div className="flex-1">
                     <div className="font-semibold text-lg">{driver.userId?.name || 'Tài xế'}</div>
                     <div className="text-gray-600">
                        <PhoneOutlined className="mr-2" />
                        {driver.userId?.phone || 'N/A'}
                     </div>
                     <div className="mt-2">
                        <Space>
                           <Tag color="gold">
                              <StarOutlined /> {driver.rating?.toFixed(1) || '5.0'}
                           </Tag>
                           <Tag>{driver.totalTrips || 0} chuyến</Tag>
                        </Space>
                     </div>
                  </div>
                  <Button type="primary" icon={<PhoneOutlined />}>
                     Gọi tài xế
                  </Button>
               </div>
            </Card>
         )}

         {/* Đang tìm tài xế */}
         {!driver && activeItem?.status === 'Created' && (
            <Card>
               <div className="text-center py-8">
                  <ClockCircleOutlined className="text-6xl text-yellow-500 mb-4" />
                  <div className="text-xl font-semibold mb-2">Đang tìm tài xế...</div>
                  <div className="text-gray-600">Hệ thống đang tìm tài xế phù hợp gần bạn nhất</div>
               </div>
            </Card>
         )}
      </div>
   )
}

