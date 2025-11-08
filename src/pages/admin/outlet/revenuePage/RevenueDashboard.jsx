import { useState, useEffect } from "react";
import { Card, Tabs, Select, Badge, Row, Col, Spin, message, Table, Avatar, Tag } from "antd";
import { DollarOutlined, RiseOutlined, CarOutlined, StockOutlined, UserOutlined } from "@ant-design/icons";
import {
   LineChart,
   Line,
   AreaChart,
   Area,
   BarChart,
   Bar,
   PieChart,
   Pie,
   Cell,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   Legend,
   ResponsiveContainer,
} from "recharts";
import { adminService } from "../../../../features/admin/api/adminService";

export default function RevenueDashboard() {
   const [timeFilter, setTimeFilter] = useState("month");
   const [loading, setLoading] = useState(false);
   const [revenueData, setRevenueData] = useState([]);
   const [totals, setTotals] = useState({
      totalDriverRevenue: 0,
      totalSystemRevenue: 0,
      totalDriverPayout: 0,
      totalOrders: 0
   });
   const [driversWithRevenue, setDriversWithRevenue] = useState([]);
   const [loadingDrivers, setLoadingDrivers] = useState(false);

   useEffect(() => {
      fetchRevenueData();
      fetchDriversWithRevenue();
   }, [timeFilter]);

   const fetchRevenueData = async () => {
      setLoading(true);
      try {
         const response = await adminService.getSystemRevenueStats({
            period: timeFilter
         });

         if (response.data.success) {
            const data = response.data.data || [];
            const totalsData = response.data.totals || {};

            // Format data cho charts
            const formattedData = data.map(item => ({
               month: item.label,
               // Tổng tiền tài xế thu nhập
               driverRevenue: item.totalDriverRevenue || 0,
               // Doanh thu hệ thống (20% phí)
               systemRevenue: item.totalSystemRevenue || 0,
               // Tiền tài xế thực nhận (80%)
               driverPayout: item.totalDriverPayout || 0,
               orders: item.totalOrders || 0
            }));

            setRevenueData(formattedData);
            setTotals(totalsData);
         } else {
            message.error('Lỗi khi lấy dữ liệu doanh thu');
         }
      } catch (error) {
         console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
         message.error('Lỗi khi lấy dữ liệu doanh thu');
      } finally {
         setLoading(false);
      }
   };

   const fetchDriversWithRevenue = async () => {
      setLoadingDrivers(true);
      try {
         const response = await adminService.getDriversWithRevenue({
            status: 'Active',
            limit: 50,
            sortBy: 'totalRevenue',
            sortOrder: 'desc'
         });

         if (response.data.success) {
            setDriversWithRevenue(response.data.data || []);
         } else {
            message.error('Lỗi khi lấy danh sách tài xế');
         }
      } catch (error) {
         console.error('Lỗi khi lấy danh sách tài xế:', error);
         message.error('Lỗi khi lấy danh sách tài xế');
      } finally {
         setLoadingDrivers(false);
      }
   };

   const formatCurrency = (value) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(value);

   // Tính toán từ totals
   const totalDriverRevenue = totals.totalDriverRevenue || 0;  // Tổng tiền tài xế thu nhập
   const totalSystemRevenue = totals.totalSystemRevenue || 0;  // Doanh thu hệ thống (20%)
   const totalDriverPayout = totals.totalDriverPayout || 0;     // Tiền tài xế thực nhận (80%)
   const totalRevenue = totalDriverRevenue;  // Tổng doanh thu = tổng tiền tài xế thu nhập

   // Data cho pie chart: Phân bổ 20% hệ thống và 80% tài xế
   const driverCommissionData = [
      { name: "Tiền tài xế (80%)", value: 80, color: "#8884d8", amount: totalDriverPayout },
      { name: "Doanh thu hệ thống (20%)", value: 20, color: "#82ca9d", amount: totalSystemRevenue },
   ];

   // Daily data (lấy từ revenueData nếu period = 'day')
   const dailyData = timeFilter === 'day'
      ? revenueData.map(item => ({
         day: item.month,
         revenue: item.driverRevenue,
         orders: item.orders
      }))
      : [
         { day: "T2", revenue: 0, orders: 0 },
         { day: "T3", revenue: 0, orders: 0 },
         { day: "T4", revenue: 0, orders: 0 },
         { day: "T5", revenue: 0, orders: 0 },
         { day: "T6", revenue: 0, orders: 0 },
         { day: "T7", revenue: 0, orders: 0 },
         { day: "CN", revenue: 0, orders: 0 },
      ];

   const tabItems = [
      {
         key: "overview",
         label: "Tổng quan",
         children: (
            <Row gutter={[16, 16]}>
               <Col xs={24} lg={12}>
                  <Card title="Xu hướng doanh thu" extra={<Badge color="green" text="Theo thời gian" />}>
                     <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                           <AreaChart data={revenueData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} />
                              <Tooltip formatter={(v) => formatCurrency(v)} />
                              <Legend />
                              <Area type="monotone" dataKey="systemRevenue" stackId="1" stroke="#1677ff" fill="#1677ff" name="Hệ thống (20%)" />
                              <Area type="monotone" dataKey="driverPayout" stackId="1" stroke="#52c41a" fill="#52c41a" name="Tài xế (80%)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>
               </Col>
               <Col xs={24} lg={12}>
                  <Card title="Hiệu suất hàng ngày" extra={<Badge color="blue" text="Theo ngày" />}>
                     <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                           <BarChart data={dailyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="day" />
                              <YAxis yAxisId="left" tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip formatter={(v, name) => [name === "revenue" ? formatCurrency(v) : v, name === "revenue" ? "Doanh thu" : "Đơn hàng"]} />
                              <Legend />
                              <Bar yAxisId="left" dataKey="revenue" fill="#1677ff" name="Doanh thu" />
                              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#ff7300" name="Đơn hàng" />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>
               </Col>
            </Row>
         ),
      },
      {
         key: "drivers",
         label: "Tài xế",
         children: (
            <Row gutter={[16, 16]}>
               <Col xs={24} lg={12}>
                  <Card title="Phân bổ doanh thu">
                     <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                           <PieChart>
                              <Pie
                                 data={driverCommissionData}
                                 cx="50%"
                                 cy="50%"
                                 outerRadius={80}
                                 dataKey="value"
                                 label={({ name, percent, amount }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                 {driverCommissionData.map((e, i) => (
                                    <Cell key={i} fill={e.color} />
                                 ))}
                              </Pie>
                              <Tooltip formatter={(value, name, props) => [
                                 formatCurrency(props.payload.amount),
                                 props.payload.name
                              ]} />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>
               </Col>
               <Col xs={24} lg={12}>
                  <Card title="Chỉ số tài xế" className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Tổng tiền tài xế thu nhập</span>
                        <Badge color="green" text={formatCurrency(totalDriverRevenue)} />
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Tiền tài xế thực nhận (80%)</span>
                        <Badge color="blue" text={formatCurrency(totalDriverPayout)} />
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Doanh thu hệ thống (20%)</span>
                        <Badge color="purple" text={formatCurrency(totalSystemRevenue)} />
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Tổng số đơn hàng</span>
                        <Badge color="orange" text={totals.totalOrders || 0} />
                     </div>
                  </Card>
               </Col>
            </Row>
         ),
      },
      {
         key: "comparison",
         label: "So sánh",
         children: (
            <Card title="So sánh doanh thu theo thời gian">
               <div style={{ width: "100%", height: 380 }}>
                  <ResponsiveContainer>
                     <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend />
                        <Line type="monotone" dataKey="systemRevenue" stroke="#1677ff" strokeWidth={2} name="Hệ thống (20%)" />
                        <Line type="monotone" dataKey="driverPayout" stroke="#52c41a" strokeWidth={2} name="Tài xế (80%)" />
                        <Line type="monotone" dataKey="driverRevenue" stroke="#faad14" strokeWidth={2} name="Tổng thu nhập tài xế" />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </Card>
         ),
      },
      {
         key: "drivers-list",
         label: "Danh sách tài xế",
         children: (
            <Card title="Danh sách tài xế và doanh thu">
               <Table
                  dataSource={driversWithRevenue}
                  loading={loadingDrivers}
                  rowKey="_id"
                  pagination={{
                     pageSize: 10,
                     showSizeChanger: true,
                     showTotal: (total) => `Tổng ${total} tài xế`
                  }}
                  columns={[
                     {
                        title: "Tài xế",
                        key: "driver",
                        width: 200,
                        render: (_, record) => (
                           <div className="flex items-center gap-3">
                              <Avatar
                                 src={record.avatarUrl}
                                 icon={<UserOutlined />}
                                 size="large"
                              />
                              <div>
                                 <div className="font-semibold">{record.name}</div>
                                 <div className="text-xs text-gray-500">{record.phone}</div>
                              </div>
                           </div>
                        )
                     },
                     {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                        width: 120,
                        render: (status) => {
                           const statusConfig = {
                              Active: { color: "green", text: "Hoạt động" },
                              Pending: { color: "orange", text: "Chờ duyệt" },
                              Blocked: { color: "red", text: "Bị khóa" },
                              Rejected: { color: "default", text: "Từ chối" }
                           };
                           const config = statusConfig[status] || { color: "default", text: status };
                           return <Tag color={config.color}>{config.text}</Tag>;
                        }
                     },
                     {
                        title: "Đánh giá",
                        dataIndex: "rating",
                        key: "rating",
                        width: 100,
                        render: (rating) => (
                           <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span>{rating?.toFixed(1) || "0.0"}</span>
                           </div>
                        )
                     },
                     {
                        title: "Tổng thu nhập",
                        dataIndex: "totalRevenue",
                        key: "totalRevenue",
                        width: 150,
                        align: "right",
                        render: (value) => (
                           <div className="font-semibold text-green-600">
                              {formatCurrency(value || 0)}
                           </div>
                        ),
                        sorter: (a, b) => (a.totalRevenue || 0) - (b.totalRevenue || 0)
                     },
                     {
                        title: "Thực nhận (80%)",
                        dataIndex: "totalDriverPayout",
                        key: "totalDriverPayout",
                        width: 150,
                        align: "right",
                        render: (value) => (
                           <div className="text-blue-600">
                              {formatCurrency(value || 0)}
                           </div>
                        ),
                        sorter: (a, b) => (a.totalDriverPayout || 0) - (b.totalDriverPayout || 0)
                     },
                     {
                        title: "Phí hệ thống (20%)",
                        dataIndex: "totalSystemFee",
                        key: "totalSystemFee",
                        width: 150,
                        align: "right",
                        render: (value) => (
                           <div className="text-purple-600">
                              {formatCurrency(value || 0)}
                           </div>
                        ),
                        sorter: (a, b) => (a.totalSystemFee || 0) - (b.totalSystemFee || 0)
                     },
                     {
                        title: "Số đơn",
                        dataIndex: "totalOrders",
                        key: "totalOrders",
                        width: 100,
                        align: "center",
                        render: (value) => (
                           <Badge count={value || 0} showZero color="blue" />
                        ),
                        sorter: (a, b) => (a.totalOrders || 0) - (b.totalOrders || 0)
                     },
                     {
                        title: "Số dư",
                        dataIndex: "incomeBalance",
                        key: "incomeBalance",
                        width: 150,
                        align: "right",
                        render: (value) => (
                           <div className="font-semibold">
                              {formatCurrency(value || 0)}
                           </div>
                        ),
                        sorter: (a, b) => (a.incomeBalance || 0) - (b.incomeBalance || 0)
                     }
                  ]}
               />
            </Card>
         ),
      },
   ];

   if (loading) {
      return (
         <div className="flex justify-center items-center h-96">
            <Spin size="large" />
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <Row align="middle" justify="space-between" gutter={[8, 8]}>
            <Col>
               <h1 className="text-2xl md:text-3xl font-semibold text-green-700 flex items-center gap-2">
                  <DollarOutlined /> Quản lý doanh thu hệ thống
               </h1>
               <div className="text-gray-500 text-sm">
                  Doanh thu hệ thống = 20% tổng tiền tài xế thu nhập
               </div>
            </Col>
            <Col>
               <div className="flex items-center gap-2">
                  <Select
                     value={timeFilter}
                     onChange={setTimeFilter}
                     style={{ width: 180 }}
                     options={[
                        { value: "day", label: "Theo ngày" },
                        { value: "week", label: "Theo tuần" },
                        { value: "month", label: "Theo tháng" },
                        { value: "year", label: "Theo năm" },
                     ]}
                  />
               </div>
            </Col>
         </Row>

         <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
               <Card>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-gray-500 text-sm">Tổng tiền tài xế thu nhập</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalDriverRevenue)}</div>
                        <div className="text-xs text-gray-500">Tổng doanh thu từ đơn hàng</div>
                     </div>
                     <DollarOutlined className="text-green-700 text-2xl" />
                  </div>
               </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
               <Card>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-gray-500 text-sm">Doanh thu hệ thống</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalSystemRevenue)}</div>
                        <div className="text-xs text-green-600">20% phí hoa hồng</div>
                     </div>
                     <StockOutlined className="text-blue-700 text-2xl" />
                  </div>
               </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
               <Card>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-gray-500 text-sm">Tiền tài xế thực nhận</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalDriverPayout)}</div>
                        <div className="text-xs text-blue-600">80% thu nhập</div>
                     </div>
                     <CarOutlined className="text-green-700 text-2xl" />
                  </div>
               </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
               <Card>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-gray-500 text-sm">Tổng số đơn hàng</div>
                        <div className="text-2xl font-bold">{totals.totalOrders || 0}</div>
                        <div className="text-xs text-gray-500">Đơn đã hoàn thành</div>
                     </div>
                     <StockOutlined className="text-green-700 text-2xl" />
                  </div>
               </Card>
            </Col>
         </Row>

         <Tabs defaultActiveKey="overview" items={tabItems} />
      </div>
   );
}
