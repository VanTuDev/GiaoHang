import { useMemo, useState, useEffect } from "react";
import { Card, Row, Col, Select, DatePicker, Statistic, Radio, Table, Spin, message } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import dayjs from "dayjs";
import { revenueService } from "../../features/revenue/api/revenueService";

const { RangePicker } = DatePicker;

export default function DriverRevenue() {
   const [range, setRange] = useState([dayjs().startOf("year"), dayjs().endOf("year")]);
   const [granularity, setGranularity] = useState("month"); // day | week | month | quarter | year
   const [preset, setPreset] = useState("year"); // week | month | quarter | year | custom
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState([]);
   const [totals, setTotals] = useState({ orders: 0, distanceKm: 0, revenue: 0, payout: 0 });

   // Fetch data từ API khi range hoặc granularity thay đổi
   useEffect(() => {
      const fetchRevenueData = async () => {
         setLoading(true);
         try {
            const response = await revenueService.getStats({
               startDate: range[0].toISOString(),
               endDate: range[1].toISOString(),
               granularity
            });

            if (response.data?.success) {
               setData(response.data.data || []);
               setTotals(response.data.totals || { orders: 0, distanceKm: 0, revenue: 0, payout: 0 });
            } else {
               message.error("Không thể tải dữ liệu doanh thu");
            }
         } catch (error) {
            console.error("Lỗi khi tải doanh thu:", error);
            message.error("Lỗi khi tải doanh thu: " + (error.response?.data?.message || error.message));
         } finally {
            setLoading(false);
         }
      };

      fetchRevenueData();
   }, [range, granularity]);

   const formatCurrency = (v) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v || 0);

   const columns = [
      { title: "Mốc", dataIndex: "label", key: "label" },
      { title: "Số đơn", dataIndex: "orders", key: "orders" },
      { title: "Số km", dataIndex: "distanceKm", key: "distanceKm" },
      { title: "Doanh thu", dataIndex: "revenue", key: "revenue", render: (v) => formatCurrency(v) },
      { title: "Thực nhận", dataIndex: "payout", key: "payout", render: (v) => formatCurrency(v) },
   ];

   if (loading && data.length === 0) {
      return (
         <div className="flex justify-center items-center h-screen">
            <Spin size="large" tip="Đang tải dữ liệu doanh thu..." />
         </div>
      );
   }

   return (
      <div className="p-4">
         <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
               <Radio.Group
                  value={preset}
                  onChange={(e) => {
                     const p = e.target.value;
                     setPreset(p);
                     if (p === "custom") return;
                     if (p === "week") setRange([dayjs().startOf("week"), dayjs().endOf("week")]);
                     if (p === "month") setRange([dayjs().startOf("month"), dayjs().endOf("month")]);
                     if (p === "quarter") setRange([dayjs().startOf("quarter"), dayjs().endOf("quarter")]);
                     if (p === "year") setRange([dayjs().startOf("year"), dayjs().endOf("year")]);
                  }}
                  options={[
                     { label: "Tuần", value: "week" },
                     { label: "Tháng", value: "month" },
                     { label: "Quý", value: "quarter" },
                     { label: "Năm", value: "year" },
                     { label: "Tùy chọn", value: "custom" },
                  ]}
                  optionType="button"
                  buttonStyle="solid"
               />
            </Col>
            <Col xs={24} md={8}>
               <Select
                  value={granularity}
                  onChange={setGranularity}
                  className="w-full"
                  options={[
                     { value: "day", label: "Ngày" },
                     { value: "week", label: "Tuần" },
                     { value: "month", label: "Tháng" },
                     { value: "quarter", label: "Quý" },
                     { value: "year", label: "Năm" },
                  ]}
               />
            </Col>
            <Col xs={24} md={6}>
               <RangePicker
                  value={range}
                  onChange={(v) => {
                     setRange(v);
                     setPreset("custom");
                  }}
                  className="w-full"
                  allowClear={false}
               />
            </Col>
         </Row>

         <Spin spinning={loading}>
            <Row gutter={[16, 16]} className="mt-2">
               <Col xs={12} md={6}><Card><Statistic title="Số đơn" value={totals.orders} /></Card></Col>
               <Col xs={12} md={6}><Card><Statistic title="Số km chạy" value={totals.distanceKm} /></Card></Col>
               <Col xs={12} md={6}><Card><Statistic title="Doanh thu" value={totals.revenue} formatter={(v) => formatCurrency(v)} /></Card></Col>
               <Col xs={12} md={6}><Card><Statistic title="Thực nhận" value={totals.payout} formatter={(v) => formatCurrency(v)} /></Card></Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-2">
               <Col xs={24} lg={12}>
                  <Card title="Đơn theo thời gian">
                     <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="orders" fill="#1e40af" name="Số đơn" />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>
               </Col>
               <Col xs={24} lg={12}>
                  <Card title="Doanh thu & Thực nhận">
                     <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" name="Doanh thu" />
                              <Line type="monotone" dataKey="payout" stroke="#059669" name="Thực nhận" />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>
               </Col>
            </Row>

            <Card className="mt-2" title="Chi tiết theo mốc">
               <div style={{ width: "100%", overflowX: "auto" }}>
                  <Table
                     dataSource={data}
                     columns={columns}
                     rowKey={(r) => r.label}
                     pagination={{ pageSize: 8, showSizeChanger: false }}
                  />
               </div>
            </Card>
         </Spin>
      </div>
   );
}


