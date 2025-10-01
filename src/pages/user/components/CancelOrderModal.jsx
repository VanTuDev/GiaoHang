import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const CancelOrderModal = ({
   open,
   onClose,
   onConfirm,
   loading = false,
   orderInfo = null
}) => {
   const [form] = Form.useForm();
   const [confirmLoading, setConfirmLoading] = useState(false);

   const handleSubmit = async (values) => {
      setConfirmLoading(true);
      try {
         await onConfirm(values.reason);
         form.resetFields();
         onClose();
      } catch (error) {
         message.error("Có lỗi xảy ra khi huỷ đơn hàng");
      } finally {
         setConfirmLoading(false);
      }
   };

   const handleCancel = () => {
      form.resetFields();
      onClose();
   };

   return (
      <Modal
         title={
            <div className="flex items-center">
               <ExclamationCircleOutlined className="text-red-500 mr-2" />
               <span>Huỷ đơn hàng</span>
            </div>
         }
         open={open}
         onCancel={handleCancel}
         footer={null}
         centered
         width={500}
      >
         <div className="mb-4">
            <p className="text-gray-600 mb-2">
               Bạn có chắc chắn muốn huỷ đơn hàng này không?
            </p>
            {orderInfo && (
               <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="font-medium">Thông tin đơn hàng:</p>
                  <p className="text-sm text-gray-600">
                     Đơn hàng #{orderInfo._id?.slice(-8)} - {orderInfo.totalPrice?.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-600">
                     Trạng thái: {orderInfo.status}
                  </p>
               </div>
            )}
            <p className="text-sm text-red-600 mb-4">
               ⚠️ Lưu ý: Bạn chỉ có thể huỷ đơn hàng khi chưa có tài xế nhận đơn.
            </p>
         </div>

         <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
         >
            <Form.Item
               name="reason"
               label="Lý do huỷ đơn hàng"
               rules={[
                  { required: true, message: "Vui lòng nhập lý do huỷ đơn hàng" },
                  { min: 10, message: "Lý do phải có ít nhất 10 ký tự" }
               ]}
            >
               <TextArea
                  rows={4}
                  placeholder="Vui lòng mô tả lý do huỷ đơn hàng..."
                  maxLength={500}
                  showCount
               />
            </Form.Item>

            <div className="flex justify-end gap-2 mt-6">
               <Button onClick={handleCancel}>
                  Không huỷ
               </Button>
               <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={confirmLoading || loading}
               >
                  Xác nhận huỷ đơn
               </Button>
            </div>
         </Form>
      </Modal>
   );
};

export default CancelOrderModal;
