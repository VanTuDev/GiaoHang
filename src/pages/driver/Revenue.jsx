import { useMemo, useState } from "react";
import { Card, Row, Col, Select, DatePicker, Statistic, Radio, Table } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const MOCK_DATA = Array.from({ length: 12 }).map((_, i) => ({
   key: i,
   label: `Th${i + 1}`,
   orders: Math.round(Math.random() * 80 + 20),
   distanceKm: Math.round(Math.random() * 800 + 200),
   revenue: Math.round(Math.random() * 40_000_000 + 10_000_000),
   payout: Math.round(Math.random() * 30_000_000 + 7_000_000),
}));

export default function DriverRevenue() {
   const [range, setRange] = useState([dayjs().startOf("year"), dayjs().endOf("year")]);
   const [granularity, setGranularity] = useState("month"); // day | week | month | quarter | year
   const [preset, setPreset] = useState("year"); // week | month | quarter | year | custom

   const data = useMemo(() => {
      // Demo: dùng MOCK_DATA, thực tế fetch API theo range + granularity
      switch (granularity) {
         case "day":
         case "week":
            return MOCK_DATA.slice(0, 7).map((d, idx) => ({ ...d, label: `D${idx + 1}` }));
         case "quarter":
            return [1, 2, 3, 4].map((q) => ({ ...MOCK_DATA[q - 1], label: `Q${q}` }));
         case "year":
            return MOCK_DATA.slice(0, 5).map((d, idx) => ({ ...d, label: `${2019 + idx}` }));
         default:
            return MOCK_DATA;
      }
   }, [range, granularity]);

   const totals = useMemo(() => {
      return data.reduce(
         (acc, cur) => {
            acc.orders += cur.orders;
            acc.distanceKm += cur.distanceKm;
            acc.revenue += cur.revenue;
            acc.payout += cur.payout;
            return acc;
         },
         { orders: 0, distanceKm: 0, revenue: 0, payout: 0 }
      );
   }, [data]);

   const formatCurrency = (v) =>
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v || 0);

   const columns = [
      { title: "Mốc", dataIndex: "label", key: "label" },
      { title: "Số đơn", dataIndex: "orders", key: "orders" },
      { title: "Số km", dataIndex: "distanceKm", key: "distanceKm" },
      { title: "Doanh thu", dataIndex: "revenue", key: "revenue", render: (v) => formatCurrency(v) },
      { title: "Thực nhận", dataIndex: "payout", key: "payout", render: (v) => formatCurrency(v) },
   ];

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
                  rowKey={(r) => r.key}
                  pagination={{ pageSize: 8, showSizeChanger: false }}
               />
            </div>
         </Card>
      </div>
   );
}


