   "use client"

   import React, { useState } from "react"
   import { Row, Col, Card, Input, Select, Tag, Avatar, Button, Statistic, Space } from "antd"
   import {
      SearchOutlined,
      TruckOutlined,
      EnvironmentOutlined,
      ClockCircleOutlined,
      PhoneOutlined,
      UserOutlined,
      StarFilled,
      FilterOutlined,
      EyeOutlined,
      MessageOutlined,
      InboxOutlined,
      ProfileOutlined
   } from "@ant-design/icons"

   // Mock data for orders
   const ordersData = [
      {
         id: "DH001",
         customerName: "Nguyễn Văn An",
         customerPhone: "0901234567",
         pickupAddress: "123 Lê Duẩn, Hải Châu, Đà Nẵng",
         deliveryAddress: "456 Nguyễn Văn Linh, Sơn Trà, Đà Nẵng",
         vehicleType: "Xe tải nhỏ",
         weight: "800kg",
         distance: "12km",
         totalPrice: 580000,
         status: "waiting_driver", // waiting_driver, driver_assigned, picked_up, in_transit, delivered, cancelled
         createdAt: "2025-01-23T08:30:00",
         estimatedTime: "45 phút",
         driver: null,
         hasInsurance: true,
         requiresLoading: true,
         orderImage: "/wrapped-parcel.png",
         priority: "normal",
      },
      {
         id: "DH002",
         customerName: "Trần Thị Bình",
         customerPhone: "0912345678",
         pickupAddress: "789 Hoàng Diệu, Ngũ Hành Sơn, Đà Nẵng",
         deliveryAddress: "321 Điện Biên Phủ, Cẩm Lệ, Đà Nẵng",
         vehicleType: "Xe tải vừa",
         weight: "2.5 tấn",
         distance: "18km",
         totalPrice: 1180000,
         status: "driver_assigned",
         createdAt: "2025-01-23T09:15:00",
         estimatedTime: "60 phút",
         driver: {
            name: "Lê Văn Cường",
            phone: "0923456789",
            rating: 4.8,
            avatar: "/professional-driver.png",
            vehicleNumber: "43A-12345",
         },
         hasInsurance: false,
         requiresLoading: true,
         orderImage: "/assorted-living-room-furniture.png",
         priority: "high",
      },
      {
         id: "DH003",
         customerName: "Phạm Minh Đức",
         customerPhone: "0934567890",
         pickupAddress: "FPT Software, Ngũ Hành Sơn, Đà Nẵng",
         deliveryAddress: "567 Trần Phú, Hải Châu, Đà Nẵng",
         vehicleType: "Xe thùng kín",
         weight: "1.2 tấn",
         distance: "8km",
         totalPrice: 660000,
         status: "in_transit",
         createdAt: "2025-01-23T07:45:00",
         estimatedTime: "30 phút",
         driver: {
            name: "Hoàng Văn Dũng",
            phone: "0945678901",
            rating: 4.6,
            avatar: "/driver2-game.png",
            vehicleNumber: "43B-67890",
         },
         hasInsurance: true,
         requiresLoading: false,
         orderImage: "/electronics-components.png",
         priority: "normal",
      },
      {
         id: "DH004",
         customerName: "Võ Thị Hoa",
         customerPhone: "0956789012",
         pickupAddress: "234 Phan Châu Trinh, Hải Châu, Đà Nẵng",
         deliveryAddress: "890 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
         vehicleType: "Xe bán tải",
         weight: "600kg",
         distance: "15km",
         totalPrice: 775000,
         status: "waiting_driver",
         createdAt: "2025-01-23T10:00:00",
         estimatedTime: "50 phút",
         driver: null,
         hasInsurance: false,
         requiresLoading: true,
         orderImage: "/modern-kitchen-appliances.png",
         priority: "urgent",
      },
      {
         id: "DH005",
         customerName: "Đặng Quốc Khánh",
         customerPhone: "0967890123",
         pickupAddress: "678 Lý Thường Kiệt, Cẩm Lệ, Đà Nẵng",
         deliveryAddress: "432 Hùng Vương, Hải Châu, Đà Nẵng",
         vehicleType: "Xe tải trung",
         weight: "4 tấn",
         distance: "22km",
         totalPrice: 1860000,
         status: "picked_up",
         createdAt: "2025-01-23T06:30:00",
         estimatedTime: "75 phút",
         driver: {
            name: "Nguyễn Thanh Long",
            phone: "0978901234",
            rating: 4.9,
            avatar: "/driver3-generic.png",
            vehicleNumber: "43C-11111",
         },
         hasInsurance: true,
         requiresLoading: true,
         orderImage: "/construction-site-city.png",
         priority: "normal",
      },
   ]

   const statusConfig = {
      waiting_driver: { label: "Đang tìm tài xế", color: "gold", icon: <ClockCircleOutlined /> },
      driver_assigned: { label: "Đã có tài xế", color: "blue", icon: <UserOutlined /> },
      picked_up: { label: "Đã lấy hàng", color: "purple", icon: <ProfileOutlined /> },
      in_transit: { label: "Đang giao", color: "orange", icon: <TruckOutlined /> },
      delivered: { label: "Đã giao", color: "green", icon: <InboxOutlined /> },
      cancelled: { label: "Đã hủy", color: "red", icon: <ClockCircleOutlined /> },
   }

   const priorityConfig = {
      normal: { label: "Bình thường", color: "default" },
      high: { label: "Cao", color: "orange" },
      urgent: { label: "Khẩn cấp", color: "red" },
   }

   export default function OrdersPage() {
      const [searchTerm, setSearchTerm] = useState("")
      const [statusFilter, setStatusFilter] = useState("all")
      const [priorityFilter, setPriorityFilter] = useState("all")

      // Filter orders based on search and filters
      const filteredOrders = ordersData.filter((order) => {
         const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())

         const matchesStatus = statusFilter === "all" || order.status === statusFilter
         const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter

         return matchesSearch && matchesStatus && matchesPriority
      })

      const formatPrice = (price) => {
         return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
         }).format(price)
      }

      const formatTime = (dateString) => {
         return new Date(dateString).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
         })
      }

      const getStatusIcon = (status) => statusConfig[status]?.icon || <ClockCircleOutlined />

      return (
         <div>
            <div className="px-4 py-4">
               <Row gutter={[16, 16]}>
                  <Col xs={24} md={6}>
                     <Card>
                        <Statistic title="Đang chờ tài xế" value={ordersData.filter(o => o.status === 'waiting_driver').length} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#d97706' }} />
                     </Card>
                  </Col>
                  <Col xs={24} md={6}>
                     <Card>
                        <Statistic title="Đang thực hiện" value={ordersData.filter(o => ['driver_assigned', 'picked_up', 'in_transit'].includes(o.status)).length} prefix={<TruckOutlined />} valueStyle={{ color: '#1d4ed8' }} />
                     </Card>
                  </Col>
                  <Col xs={24} md={6}>
                     <Card>
                        <Statistic title="Hoàn thành" value={ordersData.filter(o => o.status === 'delivered').length} prefix={<InboxOutlined />} valueStyle={{ color: '#16a34a' }} />
                     </Card>
                  </Col>
                  <Col xs={24} md={6}>
                     <Card>
                        <Statistic title="Tổng doanh thu" value={ordersData.reduce((s, o) => s + o.totalPrice, 0)} precision={0} prefix={<StarFilled />} valueStyle={{ color: '#7c3aed' }} formatter={(v) => new Intl.NumberFormat('vi-VN').format(Number(v)) + " đ"} />
                     </Card>
                  </Col>
               </Row>
            </div>

            <Card className="mx-4 mb-4">
               <Row gutter={[12, 12]}>
                  <Col xs={24} md={8}>
                     <Input placeholder="Tìm kiếm đơn hàng..." prefix={<SearchOutlined />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} allowClear />
                  </Col>
                  <Col xs={24} md={8}>
                     <Select value={statusFilter} onChange={setStatusFilter} style={{ width: '100%' }} placeholder="Trạng thái">
                        <Select.Option value="all">Tất cả trạng thái</Select.Option>
                        <Select.Option value="waiting_driver">Đang tìm tài xế</Select.Option>
                        <Select.Option value="driver_assigned">Đã có tài xế</Select.Option>
                        <Select.Option value="picked_up">Đã lấy hàng</Select.Option>
                        <Select.Option value="in_transit">Đang giao</Select.Option>
                        <Select.Option value="delivered">Đã giao</Select.Option>
                        <Select.Option value="cancelled">Đã hủy</Select.Option>
                     </Select>
                  </Col>
                  <Col xs={24} md={6}>
                     <Select value={priorityFilter} onChange={setPriorityFilter} style={{ width: '100%' }} placeholder="Độ ưu tiên">
                        <Select.Option value="all">Tất cả mức độ</Select.Option>
                        <Select.Option value="normal">Bình thường</Select.Option>
                        <Select.Option value="high">Cao</Select.Option>
                        <Select.Option value="urgent">Khẩn cấp</Select.Option>
                     </Select>
                  </Col>
                  <Col xs={24} md={2}>
                     <Button type="primary" icon={<FilterOutlined />} block>
                        Lọc ({filteredOrders.length})
                     </Button>
                  </Col>
               </Row>
            </Card>

            <Space direction="vertical" size={16} className="w-full px-4 pb-6">
               {filteredOrders.map((order) => (
                  <Card key={order.id} title={`#${order.id}`} extra={<Space size={8}><span>{new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span><Button size="small" icon={<EyeOutlined />}>Chi tiết</Button></Space>}>
                     <Row gutter={[16, 16]}>
                        <Col xs={24} lg={8}>
                           <Space direction="vertical" size={12} className="w-full">
                              <div>
                                 <div className="font-semibold mb-1">Thông tin khách hàng</div>
                                 <Space direction="vertical" size={6}>
                                    <Space size={6}><UserOutlined />{order.customerName}</Space>
                                    <Space size={6}><PhoneOutlined />{order.customerPhone}</Space>
                                 </Space>
                              </div>
                              <div>
                                 <div className="font-semibold mb-1">Chi tiết đơn hàng</div>
                                 <Space direction="vertical" size={6} className="w-full">
                                    <Space className="w-full" style={{ justifyContent: 'space-between' }}><span>Loại xe:</span><span>{order.vehicleType}</span></Space>
                                    <Space className="w-full" style={{ justifyContent: 'space-between' }}><span>Khối lượng:</span><span>{order.weight}</span></Space>
                                    <Space className="w-full" style={{ justifyContent: 'space-between' }}><span>Khoảng cách:</span><span>{order.distance}</span></Space>
                                    <Space className="w-full" style={{ justifyContent: 'space-between' }}><span>Thời gian dự kiến:</span><span>{order.estimatedTime}</span></Space>
                                    <Space className="w-full" style={{ justifyContent: 'space-between' }}><span className="font-semibold">Tổng tiền:</span><span className="text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</span></Space>
                                 </Space>
                              </div>
                              <Space wrap>
                                 {order.hasInsurance ? <Tag color="green">Có bảo hiểm</Tag> : null}
                                 {order.requiresLoading ? <Tag color="blue">Bốc hàng tận nơi</Tag> : null}
                                 <Tag color={statusConfig[order.status]?.color}>{statusConfig[order.status]?.icon}<span style={{ marginLeft: 6 }}>{statusConfig[order.status]?.label}</span></Tag>
                                 <Tag color={priorityConfig[order.priority]?.color}>{priorityConfig[order.priority]?.label}</Tag>
                              </Space>
                           </Space>
                        </Col>
                        <Col xs={24} lg={8}>
                           <Space direction="vertical" size={12} className="w-full">
                              <div>
                                 <div className="font-semibold mb-1">Địa chỉ</div>
                                 <Space direction="vertical" size={6}>
                                    <Space align="start"><EnvironmentOutlined style={{ color: '#16a34a' }} /> <span>{order.pickupAddress}</span></Space>
                                    <Space align="start"><EnvironmentOutlined style={{ color: '#ef4444' }} /> <span>{order.deliveryAddress}</span></Space>
                                 </Space>
                              </div>
                              <div>
                                 <img src={order.orderImage || "/imgs/logonen.png"} alt="Hình ảnh đơn hàng" style={{ width: '100%', height: 96, objectFit: 'cover', borderRadius: 8 }} />
                                 <div className="text-xs text-gray-500 mt-2">Hình ảnh đơn hàng</div>
                              </div>
                           </Space>
                        </Col>
                        <Col xs={24} lg={8}>
                           <div className="font-semibold mb-2">Thông tin tài xế</div>
                           {order.driver ? (
                              <Space direction="vertical" size={12} className="w-full">
                                 <Space size={12}>
                                    <Avatar src={order.driver.avatar} icon={<UserOutlined />} />
                                    <div>
                                       <div className="font-medium">{order.driver.name}</div>
                                       <Space size={6}>
                                          <StarFilled style={{ color: '#f59e0b' }} />
                                          <span className="text-sm text-gray-500">{order.driver.rating}</span>
                                       </Space>
                                    </div>
                                 </Space>
                                 <Space direction="vertical" size={6}>
                                    <Space size={8}><PhoneOutlined />{order.driver.phone}</Space>
                                    <Space size={8}><TruckOutlined />{order.driver.vehicleNumber}</Space>
                                 </Space>
                                 <Space>
                                    <Button icon={<PhoneOutlined />}>Gọi</Button>
                                    <Button icon={<MessageOutlined />}>Chat</Button>
                                 </Space>
                              </Space>
                           ) : (
                              <div style={{ textAlign: 'center', padding: '24px 0', color: '#6b7280' }}>
                                 <ClockCircleOutlined style={{ fontSize: 24 }} />
                                 <div>Đang tìm tài xế phù hợp</div>
                                 <div style={{ fontSize: 12 }}>Thời gian chờ dự kiến: 5-10 phút</div>
                              </div>
                           )}
                        </Col>
                     </Row>
                  </Card>
               ))}
               {filteredOrders.length === 0 ? (
                  <Card className="w-full text-center">
                     <Space direction="vertical" size={8}>
                        <InboxOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
                        <div className="text-lg font-semibold">Không tìm thấy đơn hàng</div>
                        <div className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                     </Space>
                  </Card>
               ) : null}
            </Space>
         </div>
      )
   }
