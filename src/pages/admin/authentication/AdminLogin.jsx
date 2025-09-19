import { useState } from "react";
import { Form, Input, message } from "antd";
// Dùng lại UI & API chung từ module authentication để tránh trùng lặp
import AuthCard from "../../../authentication/components/AuthCard";
import SubmitButton from "../../../authentication/components/SubmitButton";
import axiosClient from "../../../authentication/api/axiosClient";
import { AUTH_ENDPOINTS } from "../../../authentication/api/endpoints";
import { useAuthState } from "../../../authentication/hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";

const AdminLogin = () => {
   const [loading, setLoading] = useState(false);
   const { saveSession } = useAuthState();
   const navigate = useNavigate();
   const location = useLocation();

   // Đăng nhập Admin: chỉ chấp nhận tài khoản có role = "Admin"
   const onFinish = async (values) => {
      setLoading(true);
      try {
         const payload = { email: values.email, password: values.password };
         const { data } = await axiosClient.post(AUTH_ENDPOINTS.login, payload);

         if (data?.success) {
            const user = data.data?.user;

            if (user.role !== "Admin") {
               message.error("Bạn không có quyền truy cập Admin");
               setLoading(false);
               return;
            }

            // Lưu session dùng hook chung để đảm bảo đồng bộ localStorage
            saveSession(data.data);
            message.success("Đăng nhập Admin thành công");

            // Điều hướng về dashboard admin
            const from = location.state?.from || "/admin";
            navigate(from, { replace: true });
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Đăng nhập thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard title="Đăng nhập Admin" subtitle="Dành cho Quản trị viên hệ thống">
         <Form layout="vertical" onFinish={onFinish} className="space-y-2">
            <Form.Item
               label="Email"
               name="email"
               rules={[{ required: true, message: "Vui lòng nhập email" }]}
            >
               <Input placeholder="admin@example.com" />
            </Form.Item>
            <Form.Item
               label="Mật khẩu"
               name="password"
               rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
               <Input.Password placeholder="••••••••" />
            </Form.Item>
            <div className="flex items-center justify-between">
               <Link to="/auth/forgot" className="text-green-700">
                  Quên mật khẩu?
               </Link>
               <SubmitButton loading={loading}>Đăng nhập</SubmitButton>
            </div>
         </Form>
      </AuthCard>
   );
};

export default AdminLogin;
