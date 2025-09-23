import React, { useMemo } from "react";
import { Card, Col, Form, Input, Row, Switch, Typography } from "antd";
import { calcItemPrice, findPricePerKmByWeightKg } from "../../../features/pricing/calcPrice";

const { Text } = Typography;

export default function ItemForm({ idx, value = {}, onChange, onRemove, initialVehicleType }) {
   const [form] = Form.useForm();

   const sync = () => {
      const v = form.getFieldsValue();
      onChange?.(v);
   };

   const pricePerKm = useMemo(() => findPricePerKmByWeightKg(Number(value.weightKg || 0)), [value.weightKg]);
   const totalItem = useMemo(() => calcItemPrice({
      weightKg: Number(value.weightKg || 0),
      distanceKm: Number(value.distanceKm || 0),
      loadingAssist: Boolean(value.loadingService),
      insurance: value.insurance ? 100000 : 0,
   }), [value.weightKg, value.distanceKm, value.loadingService, value.insurance]);

   return (
      <Card size="small" title={`Hàng hóa #${idx + 1}`} extra={<button className="text-red-600" onClick={onRemove}>Xoá</button>} className="mb-3">
         <Form form={form} layout="vertical" initialValues={{ vehicleType: initialVehicleType, ...value }} onValuesChange={sync}>
            <Row gutter={12}>
               <Col xs={24} sm={12} md={6}>
                  <Form.Item name="vehicleType" label="Loại xe" rules={[{ required: true, message: "Chọn loại" }]}>
                     <Input placeholder="TruckSmall / TruckMedium ..." />
                  </Form.Item>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <Form.Item name="weightKg" label="Khối lượng (kg)" rules={[{ required: true }]}>
                     <Input type="number" min={1} />
                  </Form.Item>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <Form.Item name="distanceKm" label="Quãng đường (km)" rules={[{ required: true }]}>
                     <Input type="number" min={0} step="0.1" />
                  </Form.Item>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <Form.Item name="loadingService" label="Bốc hàng" valuePropName="checked">
                     <Switch />
                  </Form.Item>
               </Col>
            </Row>
            <Row gutter={12}>
               <Col xs={24} sm={12} md={6}>
                  <Form.Item name="insurance" label="Bảo hiểm" valuePropName="checked">
                     <Switch />
                  </Form.Item>
               </Col>
               <Col xs={24} md={18} className="flex items-center">
                  <div className="text-sm text-gray-600">
                     <div>Đơn giá: <Text strong>{pricePerKm.toLocaleString("vi-VN")} đ/km</Text></div>
                     <div>Tạm tính: <Text strong className="text-blue-700">{totalItem.toLocaleString("vi-VN")} đ</Text></div>
                  </div>
               </Col>
            </Row>
         </Form>
      </Card>
   );
}


