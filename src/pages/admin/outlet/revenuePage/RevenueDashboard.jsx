import { useState } from "react";
import { Card, Tabs, Select, Badge, Row, Col } from "antd";
import { DollarOutlined, RiseOutlined, CarOutlined, StockOutlined, FilterOutlined } from "@ant-design/icons";
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

// Mock data (JSX-ready, không dùng TS types)
const revenueData = [
   { month: "T1", systemRevenue: 45000000, driverRevenue: 120000000, adRevenue: 8000000 },
   { month: "T2", systemRevenue: 52000000, driverRevenue: 135000000, adRevenue: 9500000 },
   { month: "T3", systemRevenue: 48000000, driverRevenue: 128000000, adRevenue: 7800000 },
   { month: "T4", systemRevenue: 61000000, driverRevenue: 155000000, adRevenue: 11200000 },
   { month: "T5", systemRevenue: 58000000, driverRevenue: 148000000, adRevenue: 10800000 },
   { month: "T6", systemRevenue: 67000000, driverRevenue: 172000000, adRevenue: 12500000 },
];

const dailyData = [
   { day: "T2", revenue: 2800000, orders: 145 },
   { day: "T3", revenue: 3200000, orders: 167 },
   { day: "T4", revenue: 2950000, orders: 152 },
   { day: "T5", revenue: 3800000, orders: 198 },
   { day: "T6", revenue: 4200000, orders: 215 },
   { day: "T7", revenue: 3900000, orders: 201 },
   { day: "CN", revenue: 3500000, orders: 178 },
];

const driverCommissionData = [
   { name: "Hoa hồng tài xế", value: 85, color: "#8884d8" },
   { name: "Doanh thu hệ thống", value: 15, color: "#82ca9d" },
];

const adRevenueData = [
   { category: "Banner quảng cáo", revenue: 4500000 },
   { category: "Quảng cáo video", revenue: 3200000 },
   { category: "Sponsored rides", revenue: 2800000 },
   { category: "Partner promotion", revenue: 1500000 },
];

export default function RevenueDashboard() {
   const [timeFilter, setTimeFilter] = useState("month");

   const formatCurrency = (value) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(value);

   const totalSystemRevenue = revenueData.reduce((sum, item) => sum + item.systemRevenue, 0);
   const totalDriverRevenue = revenueData.reduce((sum, item) => sum + item.driverRevenue, 0);
   const totalAdRevenue = revenueData.reduce((sum, item) => sum + item.adRevenue, 0);
   const totalRevenue = totalSystemRevenue + totalDriverRevenue + totalAdRevenue;

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
                              <Area type="monotone" dataKey="systemRevenue" stackId="1" stroke="#1677ff" fill="#1677ff" name="Hệ thống" />
                              <Area type="monotone" dataKey="driverRevenue" stackId="1" stroke="#52c41a" fill="#52c41a" name="Tài xế" />
                              <Area type="monotone" dataKey="adRevenue" stackId="1" stroke="#faad14" fill="#faad14" name="Quảng cáo" />
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
                  <Card title="Phân bổ hoa hồng tài xế">
                     <div style={{ width: "100%,", height: 300 }}>
                        <ResponsiveContainer>
                           <PieChart>
                              <Pie data={driverCommissionData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                 label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                 {driverCommissionData.map((e, i) => (
                                    <Cell key={i} fill={e.color} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>
               </Col>
               <Col xs={24} lg={12}>
                  <Card title="Chỉ số tài xế" className="space-y-3">
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Tổng tiền tài xế nhận</span>
                        <Badge color="green" text={formatCurrency(totalDriverRevenue)} />
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Hoa hồng trung bình</span>
                        <Badge color="blue" text="85%" />
                     </div>
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Số tài xế hoạt động</span>
                        <Badge color="purple" text="1,247" />
                     </div>
                  </Card>
               </Col>
            </Row>
         ),
      },
      {
         key: "ads",
         label: "Quảng cáo",
         children: (
            <Row gutter={[16, 16]}>
               <Col xs={24}>
                  <Card title="Doanh thu quảng cáo theo loại">
                     <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                           <BarChart data={adRevenueData} layout="horizontal">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`} />
                              <YAxis dataKey="category" type="category" width={120} />
                              <Tooltip formatter={(v) => formatCurrency(v)} />
                              <Bar dataKey="revenue" fill="#faad14" />
                           </BarChart>
                        </ResponsiveContainer>
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
                        <Line type="monotone" dataKey="systemRevenue" stroke="#1677ff" strokeWidth={2} name="Hệ thống" />
                        <Line type="monotone" dataKey="driverRevenue" stroke="#52c41a" strokeWidth={2} name="Tài xế" />
                        <Line type="monotone" dataKey="adRevenue" stroke="#faad14" strokeWidth={2} name="Quảng cáo" />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </Card>
         ),
      },
   ];

   return (
      <div className="space-y-4">
         <Row align="middle" justify="space-between" gutter={[8, 8]}>
            <Col>
               <h1 className="text-2xl md:text-3xl font-semibold text-green-700 flex items-center gap-2">
                  <DollarOutlined /> Quản lý doanh thu hệ thống
               </h1>
               <div className="text-gray-500 text-sm">Theo dõi và phân tích doanh thu toàn diện</div>
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
                        { value: "custom", label: "Tùy chỉnh" },
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
                        <div className="text-gray-500 text-sm">Tổng doanh thu</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <div className="text-xs text-green-600 flex items-center gap-1"><RiseOutlined /> +12.5%</div>
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
                        <div className="text-xs text-green-600 flex items-center gap-1"><RiseOutlined /> +8.2%</div>
                     </div>
                     <StockOutlined className="text-green-700 text-2xl" />
                  </div>
               </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
               <Card>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-gray-500 text-sm">Tiền tài xế</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalDriverRevenue)}</div>
                        <div className="text-xs text-green-600 flex items-center gap-1"><RiseOutlined /> +15.3%</div>
                     </div>
                     <CarOutlined className="text-green-700 text-2xl" />
                  </div>
               </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
               <Card>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="text-gray-500 text-sm">Doanh thu quảng cáo</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalAdRevenue)}</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">-2.1%</div>
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
