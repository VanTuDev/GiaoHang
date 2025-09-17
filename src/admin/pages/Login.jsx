import { useState } from "react";
import { Form, Input, message } from "antd";
import AuthCard from "../../authentication/components/AuthCard";
import SubmitButton from "../../authentication/components/SubmitButton";
import axiosClient from "../../authentication/api/axiosClient";
import { AUTH_ENDPOINTS } from "../../authentication/api/endpoints";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const onFinish = async (values) => {
      setLoading(true);
      try {
         const { data } = await axiosClient.post(AUTH_ENDPOINTS.login, values);
         if (data?.success) {
            if (data.data?.user?.role !== "Admin") {
               message.error("Tài khoản không có quyền Admin");
               return;
            }
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            localStorage.setItem("authUser", JSON.stringify(data.data.user));
            message.success("Đăng nhập admin thành công");
            navigate("/admin", { replace: true });
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Đăng nhập thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard title="Admin Login" subtitle="Dành cho Quản trị viên">
         <Form layout="vertical" onFinish={onFinish} className="space-y-2">
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
               <Input placeholder="admin@example.com" />
            </Form.Item>
            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
               <Input.Password placeholder="••••••••" />
            </Form.Item>
            <div className="flex justify-end">
               <SubmitButton loading={loading}>Đăng nhập</SubmitButton>
            </div>
         </Form>
      </AuthCard>
   );
}


