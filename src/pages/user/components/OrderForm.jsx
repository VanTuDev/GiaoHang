import React from "react";
import { EnvironmentOutlined } from "@ant-design/icons";
import { Form, Input, Button, Card } from "antd";

const { TextArea } = Input;

const OrderForm = ({
   form,
   onSubmit,
   submitting,
   totalPrice,
   formatCurrency
}) => {
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
            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Form.Item
                  name="pickupAddress"
                  label="Địa chỉ lấy hàng"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ lấy hàng" }]}
               >
                  <Input
                     prefix={<EnvironmentOutlined />}
                     placeholder="Nhập địa chỉ lấy hàng"
                  />
               </Form.Item>

               <Form.Item
                  name="dropoffAddress"
                  label="Địa chỉ giao hàng"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
               >
                  <Input
                     prefix={<EnvironmentOutlined />}
                     placeholder="Nhập địa chỉ giao hàng"
                  />
               </Form.Item>
            </div>

            {/* Customer Note */}
            <Form.Item
               name="customerNote"
               label="Ghi chú"
            >
               <TextArea
                  rows={3}
                  placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
               />
            </Form.Item>

            {/* Submit Button */}
            <div className="flex justify-between items-center mt-4">
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
