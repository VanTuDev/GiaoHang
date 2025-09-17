import { useState } from "react";
import { Form, Input, message } from "antd";
import AuthCard from "../components/AuthCard";
import SubmitButton from "../components/SubmitButton";
import axiosClient from "../api/axiosClient";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import OTPInput from "../components/OTPInput";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
   const [loading, setLoading] = useState(false);
   const [code, setCode] = useState("");
   const location = useLocation();
   const navigate = useNavigate();

   const onFinish = async (values) => {
      setLoading(true);
      try {
         const payload = {
            email: values.email,
            code,
            newPassword: values.newPassword,
         };
         const { data } = await axiosClient.post(AUTH_ENDPOINTS.resetPassword, payload);
         if (data?.success) {
            message.success("Đặt lại mật khẩu thành công");
            navigate("/auth/login");
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Đặt lại mật khẩu thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard title="Đặt lại mật khẩu" subtitle="Nhập OTP và mật khẩu mới">
         <Form
            layout="vertical"
            onFinish={onFinish}
            className="space-y-2"
            initialValues={{ email: location.state?.email }}
         >
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
               <Input placeholder="email@example.com" />
            </Form.Item>

            <div className="mb-2">
               <label className="block mb-1 text-sm">Mã OTP</label>
               <OTPInput value={code} onChange={setCode} />
            </div>

            <Form.Item
               label="Mật khẩu mới"
               name="newPassword"
               rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
            >
               <Input.Password placeholder="••••••••" />
            </Form.Item>

            <div className="flex items-center justify-between">
               <Link to="/auth/login" className="text-green-700">
                  Quay lại đăng nhập
               </Link>
               <SubmitButton loading={loading} disabled={code.length < 6}>
                  Đặt lại mật khẩu
               </SubmitButton>
            </div>
         </Form>
      </AuthCard>
   );
}


