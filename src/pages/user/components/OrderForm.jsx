import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { EnvironmentOutlined, AimOutlined, SearchOutlined, DollarOutlined, LoadingOutlined, SafetyCertificateOutlined, ToolOutlined } from "@ant-design/icons";
import { Form, Input, InputNumber, Button, Card, Row, Col, Segmented, Space, Radio, message, Spin, Checkbox } from "antd";
// OpenStreetMap via react-leaflet
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { calculateRoadDistance } from "../../../utils/distance";

const { TextArea } = Input;

const OrderForm = ({
   form,
   onSubmit,
   submitting,
   totalPrice,
   formatCurrency,
   onDistanceChange, // Callback để truyền khoảng cách về component cha
   buttonText = "Đặt đơn hàng",
   disabled = false,
   priceBreakdown = null // Breakdown giá chi tiết từ component cha
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
   const [calculatingDistance, setCalculatingDistance] = useState(false);
   const [currentDistance, setCurrentDistance] = useState(null); // Khoảng cách hiện tại (km)
   const debounceTimerRef = useRef(null);

   const defaultCenter = useMemo(() => ({ lat: 16.047079, lng: 108.206230 }), []); // Đà Nẵng

   // Sử dụng Form.useWatch để theo dõi thay đổi tọa độ
   const pickupLat = Form.useWatch("pickupLat", form);
   const pickupLng = Form.useWatch("pickupLng", form);
   const dropoffLat = Form.useWatch("dropoffLat", form);
   const dropoffLng = Form.useWatch("dropoffLng", form);

   const getPoint = (key) => {
      const lat = form.getFieldValue(`${key}Lat`);
      const lng = form.getFieldValue(`${key}Lng`);
      if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
      return null;
   };

   const setPoint = (key, lat, lng) => {
      form.setFieldsValue({ [`${key}Lat`]: lat, [`${key}Lng`]: lng });
   };

   // Tính khoảng cách khi có đủ cả hai điểm
   const calculateDistance = useCallback(async () => {
      const pickup = getPoint("pickup");
      const dropoff = getPoint("dropoff");

      if (!pickup || !dropoff) {
         if (onDistanceChange) {
            onDistanceChange(null);
         }
         return;
      }

      setCalculatingDistance(true);
      try {
         const distance = await calculateRoadDistance(
            pickup.lat,
            pickup.lng,
            dropoff.lat,
            dropoff.lng
         );
         
         if (distance > 0) {
            setCurrentDistance(distance); // Lưu khoảng cách để hiển thị
            if (onDistanceChange) {
               onDistanceChange(distance);
            }
         } else {
            setCurrentDistance(null);
         }
      } catch (error) {
         console.error("Lỗi khi tính khoảng cách:", error);
         message.error("Không thể tính khoảng cách. Vui lòng thử lại.");
         setCurrentDistance(null);
      } finally {
         setCalculatingDistance(false);
      }
   }, [onDistanceChange, form]);

   // Theo dõi thay đổi tọa độ và tự động tính khoảng cách
   useEffect(() => {
      // Clear timer trước đó nếu có
      if (debounceTimerRef.current) {
         clearTimeout(debounceTimerRef.current);
      }

      // Kiểm tra nếu có đủ cả hai điểm
      if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
         // Debounce để tránh tính toán quá nhiều lần
         debounceTimerRef.current = setTimeout(() => {
            calculateDistance();
         }, 500);
      } else {
         // Nếu thiếu điểm, đặt khoảng cách về null
         if (onDistanceChange) {
            onDistanceChange(null);
         }
      }

      return () => {
         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
         }
      };
   }, [pickupLat, pickupLng, dropoffLat, dropoffLng, calculateDistance, onDistanceChange]);

   // Cleanup timers khi component unmount
   useEffect(() => {
      return () => {
         if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
         }
         if (addressGeocodeTimerRef.current.pickup) {
            clearTimeout(addressGeocodeTimerRef.current.pickup);
         }
         if (addressGeocodeTimerRef.current.dropoff) {
            clearTimeout(addressGeocodeTimerRef.current.dropoff);
         }
      };
   }, []);

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

   // Geocode địa chỉ khi người dùng nhập thủ công
   const handleAddressGeocode = async (address, fieldType) => {
      if (!address || address.trim().length < 5) return; // Chỉ geocode nếu địa chỉ đủ dài

      try {
         const res = await geocode(address);
         if (res) {
            setPoint(fieldType, res.lat, res.lng);
            // Cập nhật lại địa chỉ với format từ geocoding nếu cần
            if (res.label && res.label !== address) {
               form.setFieldsValue({ [fieldType === "pickup" ? "pickupAddress" : "dropoffAddress"]: res.label });
            }
         }
      } catch (error) {
         console.error("Lỗi khi geocode địa chỉ:", error);
      }
   };

   // Debounce cho việc geocode địa chỉ khi người dùng nhập
   const addressGeocodeTimerRef = useRef({ pickup: null, dropoff: null });

   const handleAddressChange = (fieldType, address) => {
      // Clear timer trước đó
      if (addressGeocodeTimerRef.current[fieldType]) {
         clearTimeout(addressGeocodeTimerRef.current[fieldType]);
      }

      // Đợi 1.5 giây sau khi người dùng ngừng nhập rồi mới geocode
      addressGeocodeTimerRef.current[fieldType] = setTimeout(() => {
         handleAddressGeocode(address, fieldType);
      }, 1500);
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
               customerNote: "",
               paymentBy: "sender", // Mặc định: người đặt trả tiền
               loadingService: false,
               insurance: false
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
                        onBlur={(e) => {
                           const address = e.target.value;
                           if (address) {
                              handleAddressGeocode(address, "pickup");
                           }
                        }}
                        onChange={(e) => {
                           const address = e.target.value;
                           handleAddressChange("pickup", address);
                        }}
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
                        onBlur={(e) => {
                           const address = e.target.value;
                           if (address) {
                              handleAddressGeocode(address, "dropoff");
                           }
                        }}
                        onChange={(e) => {
                           const address = e.target.value;
                           handleAddressChange("dropoff", address);
                        }}
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

            {/* Hiển thị khoảng cách đường đi */}
            {(currentDistance !== null || calculatingDistance) && (
               <Card 
                  size="small" 
                  className="mb-4"
                  style={{ backgroundColor: '#f0f9ff', borderColor: '#3b82f6' }}
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-blue-500" />
                        <div>
                           <div className="text-sm text-gray-600">Khoảng cách đường đi</div>
                           {calculatingDistance ? (
                              <div className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                 <Spin size="small" indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} />
                                 <span>Đang tính toán...</span>
                              </div>
                           ) : currentDistance !== null ? (
                              <div className="text-lg font-semibold text-blue-600">
                                 {currentDistance.toFixed(1)} km
                              </div>
                           ) : null}
                        </div>
                     </div>
                  </div>
               </Card>
            )}

            {/* Trọng tải hàng hóa */}
            <Form.Item
               name="weightKg"
               label="Trọng tải hàng hóa (kg)"
               rules={[
                  { required: true, message: "Vui lòng nhập trọng tải hàng hóa" },
                  { type: 'number', min: 1, message: "Trọng tải phải lớn hơn 0" }
               ]}
            >
               <InputNumber
                  min={1}
                  placeholder="Nhập trọng tải hàng hóa (ví dụ: 1000)"
                  style={{ width: '100%' }}
                  addonAfter="kg"
               />
            </Form.Item>

            {/* Service Selection */}
            <Card 
               size="small" 
               className="mb-4"
               title={
                  <span className="text-sm font-semibold">
                     <ToolOutlined className="mr-2" />
                     Dịch vụ bổ sung
                  </span>
               }
               style={{ backgroundColor: '#fafafa' }}
            >
               <Form.Item
                  name="loadingService"
                  valuePropName="checked"
               >
                  <Checkbox>
                     <div>
                        <div className="font-medium">Dịch vụ bốc xếp hàng hóa (+50,000đ)</div>
                        <div className="text-xs text-gray-500 mt-1">
                           Tài xế sẽ hỗ trợ bốc xếp hàng hóa tại điểm lấy và giao
                        </div>
                     </div>
                  </Checkbox>
               </Form.Item>

               <Form.Item
                  name="insurance"
                  valuePropName="checked"
               >
                  <Checkbox>
                     <div>
                        <div className="font-medium flex items-center">
                           <SafetyCertificateOutlined className="mr-1 text-green-600" />
                           Bảo hiểm hàng hóa (+100,000đ)
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                           Bảo hiểm toàn bộ hàng hóa trong quá trình vận chuyển
                        </div>
                     </div>
                  </Checkbox>
               </Form.Item>
            </Card>

            {/* Payment By - Người trả tiền */}
            <Form.Item
               name="paymentBy"
               label={
                  <span>
                     <DollarOutlined className="mr-2" />
                     Người trả tiền
                  </span>
               }
               rules={[{ required: true, message: "Vui lòng chọn người trả tiền" }]}
            >
               <Radio.Group>
                  <Radio value="sender">
                     <div>
                        <strong>Người đặt trả tiền</strong>
                        <div className="text-xs text-gray-500 mt-1">
                           Thanh toán trước khi lấy hàng thành công
                        </div>
                     </div>
                  </Radio>
                  <Radio value="receiver" className="mt-2">
                     <div>
                        <strong>Người nhận trả tiền</strong>
                        <div className="text-xs text-gray-500 mt-1">
                           Thanh toán trước khi giao hàng thành công
                        </div>
                     </div>
                  </Radio>
               </Radio.Group>
            </Form.Item>

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

            {/* Breakdown giá chi tiết */}
            {priceBreakdown && (
               <Card 
                  size="small" 
                  className="mb-4"
                  title={
                     <span className="text-sm font-semibold">
                        <DollarOutlined className="mr-2" />
                        Chi tiết tính toán giá
                     </span>
                  }
                  style={{ backgroundColor: '#f9fafb' }}
               >
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Khoảng cách:</span>
                        <span className="font-medium">{priceBreakdown.distanceKm} km</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Trọng tải:</span>
                        <span className="font-medium">{priceBreakdown.weightKg} kg ({priceBreakdown.ton} tấn)</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Giá/km:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(priceBreakdown.pricePerKm)}/km</span>
                     </div>
                     <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                           <span className="text-gray-600">Phí vận chuyển ({priceBreakdown.distanceKm} km × {formatCurrency(priceBreakdown.pricePerKm)}/km):</span>
                           <span className="font-semibold text-lg text-blue-600">
                              {formatCurrency(priceBreakdown.distanceCost)}
                           </span>
                        </div>
                     </div>
                  </div>
               </Card>
            )}

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
                  disabled={disabled}
                  className="bg-blue-600"
                  size="large"
               >
                  {buttonText}
               </Button>
            </div>
         </Form>
      </Card>
   );
};

export default OrderForm;
