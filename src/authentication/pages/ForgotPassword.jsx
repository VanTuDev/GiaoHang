import { useState } from "react";
import { Form, Input, message } from "antd";
import AuthCard from "../components/AuthCard";
import SubmitButton from "../components/SubmitButton";
import axiosClient from "../api/axiosClient";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const onFinish = async (values) => {
      setLoading(true);
      try {
         const { data } = await axiosClient.post(
            AUTH_ENDPOINTS.forgotPassword,
            { email: values.email }
         );
         if (data?.success) {
            message.success("Đã gửi OTP đặt lại mật khẩu");
            navigate("/auth/reset", { state: { email: values.email } });
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Gửi OTP thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard title="Quên mật khẩu" subtitle="Nhập email để nhận OTP">
         <Form layout="vertical" onFinish={onFinish} className="space-y-2">
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
               <Input placeholder="email@example.com" />
            </Form.Item>
            <div className="flex items-center justify-between">
               <Link to="/auth/login" className="text-green-700">Quay lại đăng nhập</Link>
               <SubmitButton loading={loading}>Gửi OTP</SubmitButton>
            </div>
         </Form>
      </AuthCard>
   );
}


