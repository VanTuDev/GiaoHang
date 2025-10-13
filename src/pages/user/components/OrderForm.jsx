import React, { useMemo, useRef, useState } from "react";
import { EnvironmentOutlined, AimOutlined, SearchOutlined } from "@ant-design/icons";
import { Form, Input, Button, Card, Row, Col, Segmented, Space } from "antd";
// OpenStreetMap via react-leaflet
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const { TextArea } = Input;

const OrderForm = ({
   form,
   onSubmit,
   submitting,
   totalPrice,
   formatCurrency
}) => {
   // icon marker tuỳ biến nhỏ gọn
   const markerIcon = useMemo(() => new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
   }), []);

   const [activePoint, setActivePoint] = useState("pickup"); // pickup | dropoff
   const [searchQuery, setSearchQuery] = useState("");

   const defaultCenter = useMemo(() => ({ lat: 16.047079, lng: 108.206230 }), []); // Đà Nẵng

   const getPoint = (key) => {
      const lat = form.getFieldValue(`${key}Lat`);
      const lng = form.getFieldValue(`${key}Lng`);
      if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
      return null;
   };

   const setPoint = (key, lat, lng) => {
      form.setFieldsValue({ [`${key}Lat`]: lat, [`${key}Lng`]: lng });
   };

   const reverseGeocode = async (lat, lng) => {
      try {
         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;
         const resp = await fetch(url, { headers: { "Accept": "application/json" } });
         const data = await resp.json();
         return data?.display_name || "";
      } catch {
         return "";
      }
   };

   const geocode = async (query) => {
      if (!query) return null;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=1`;
      const resp = await fetch(url, { headers: { "Accept": "application/json" } });
      const results = await resp.json();
      if (Array.isArray(results) && results[0]) {
         const r = results[0];
         return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name };
      }
      return null;
   };

   const MapClick = ({ currentKey }) => {
      useMapEvents({
         async click(e) {
            const { lat, lng } = e.latlng;
            setPoint(currentKey, lat, lng);
            const addr = await reverseGeocode(lat, lng);
            if (addr) {
               const field = currentKey === "pickup" ? "pickupAddress" : "dropoffAddress";
               form.setFieldsValue({ [field]: addr });
            }
         }
      });
      return null;
   };

   const handleSearch = async () => {
      const res = await geocode(searchQuery);
      if (!res) return;
      setPoint(activePoint, res.lat, res.lng);
      const field = activePoint === "pickup" ? "pickupAddress" : "dropoffAddress";
      if (res.label) form.setFieldsValue({ [field]: res.label });
   };

   return (
      <Card title="Thông tin đơn hàng" className="shadow-sm">
         <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{
               pickupAddress: "",
               dropoffAddress: "",
               customerNote: ""
            }}
         >
            {/* Khu vực địa điểm + Map */}
            <Row gutter={[16, 16]}>
               <Col xs={24} md={12}>
                  <Form.Item
                     name="pickupAddress"
                     label="Địa chỉ lấy hàng"
                     rules={[{ required: true, message: "Vui lòng nhập địa chỉ lấy hàng" }]}
                  >
                     <Input
                        prefix={<EnvironmentOutlined />}
                        placeholder="Nhập hoặc chọn trên bản đồ"
                     />
                  </Form.Item>
                  <Form.Item
                     name="dropoffAddress"
                     label="Địa chỉ giao hàng"
                     rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
                  >
                     <Input
                        prefix={<EnvironmentOutlined />}
                        placeholder="Nhập hoặc chọn trên bản đồ"
                     />
                  </Form.Item>

                  {/* Hidden to store coords */}
                  <Form.Item name="pickupLat" hidden><Input /></Form.Item>
                  <Form.Item name="pickupLng" hidden><Input /></Form.Item>
                  <Form.Item name="dropoffLat" hidden><Input /></Form.Item>
                  <Form.Item name="dropoffLng" hidden><Input /></Form.Item>
               </Col>

               <Col xs={24} md={12}>
                  <div className="mb-2 flex items-center justify-between">
                     <Segmented
                        size="small"
                        value={activePoint}
                        onChange={setActivePoint}
                        options={[
                           { label: "Chọn điểm lấy", value: "pickup" },
                           { label: "Chọn điểm giao", value: "dropoff" }
                        ]}
                     />
                     <Space.Compact style={{ width: 260 }}>
                        <Input
                           allowClear
                           placeholder="Tìm địa điểm (OpenStreetMap)"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           prefix={<SearchOutlined />}
                        />
                        <Button onClick={handleSearch} icon={<AimOutlined />}>Chọn</Button>
                     </Space.Compact>
                  </div>
                  <div style={{ height: 280, borderRadius: 8, overflow: "hidden" }}>
                     <MapContainer
                        center={getPoint(activePoint) || defaultCenter}
                        zoom={13}
                        scrollWheelZoom
                        style={{ height: "100%", width: "100%" }}
                     >
                        <TileLayer
                           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {getPoint("pickup") && (
                           <Marker position={getPoint("pickup")} icon={markerIcon} />
                        )}
                        {getPoint("dropoff") && (
                           <Marker position={getPoint("dropoff")} icon={markerIcon} />
                        )}
                        <MapClick currentKey={activePoint} />
                     </MapContainer>
                  </div>
               </Col>
            </Row>

            {/* Customer Note */}
            <Form.Item
               name="customerNote"
               label="Ghi chú"
            >
               <TextArea
                  rows={2}
                  placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
               />
            </Form.Item>

            {/* Submit Button */}
            <div className="flex justify-between items-center mt-2">
               <div className="text-lg">
                  <span className="font-medium">Tổng cộng: </span>
                  <span className="font-bold text-blue-600">
                     {formatCurrency(totalPrice)}
                  </span>
               </div>

               <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="bg-blue-600"
                  size="large"
               >
                  Đặt đơn hàng
               </Button>
            </div>
         </Form>
      </Card>
   );
};

export default OrderForm;
