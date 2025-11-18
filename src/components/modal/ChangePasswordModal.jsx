import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { profileService } from "../../features/profile/api/profileService";

const ChangePasswordModal = ({ open, onClose }) => {
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (values) => {
      setLoading(true);
      try {
         const response = await profileService.changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
         });

         if (response.data?.success) {
            message.success("Đổi mật khẩu thành công!");
            form.resetFields();
            onClose();
         } else {
            message.error(response.data?.message || "Có lỗi xảy ra");
         }
      } catch (error) {
         message.error(error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu");
      } finally {
         setLoading(false);
      }
   };

   const handleCancel = () => {
      form.resetFields();
      onClose();
   };

   return (
      <Modal
         title="Đổi mật khẩu"
         open={open}
         onCancel={handleCancel}
         onOk={() => form.submit()}
         confirmLoading={loading}
         okText="Đổi mật khẩu"
         cancelText="Hủy"
         width={500}
      >
         <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
         >
            <Form.Item
               name="currentPassword"
               label="Mật khẩu hiện tại"
               rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu hiện tại" }
               ]}
            >
               <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu hiện tại"
                  size="large"
               />
            </Form.Item>

            <Form.Item
               name="newPassword"
               label="Mật khẩu mới"
               rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
               ]}
            >
               <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới"
                  size="large"
               />
            </Form.Item>

            <Form.Item
               name="confirmPassword"
               label="Xác nhận mật khẩu mới"
               dependencies={['newPassword']}
               rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                  ({ getFieldValue }) => ({
                     validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                           return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                     },
                  }),
               ]}
            >
               <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập lại mật khẩu mới"
                  size="large"
               />
            </Form.Item>
         </Form>
      </Modal>
   );
};

export default ChangePasswordModal;








