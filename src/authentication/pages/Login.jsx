import { useState } from "react";
import { Form, Input, Tabs, Typography, message } from "antd";
import AuthCard from "../components/AuthCard";
import SubmitButton from "../components/SubmitButton";
import axiosClient from "../api/axiosClient";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { useAuthState } from "../hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getPostLoginPath } from "../../utils/navigation";

export default function Login() {
   const [loading, setLoading] = useState(false);
   const { saveSession } = useAuthState();
   const navigate = useNavigate();
   const location = useLocation();

   const onFinish = async (values) => {
      setLoading(true);
      try {
         const payload = values.email
            ? { email: values.email, password: values.password }
            : { phone: values.phone, password: values.password };
         const { data } = await axiosClient.post(AUTH_ENDPOINTS.login, payload);
         if (data?.success) {
            // Lưu session (user, accessToken, refreshToken)
            saveSession(data.data);
            message.success("Đăng nhập thành công");
            // Nếu user là Admin nhưng login ở trang user, vẫn điều hướng về trang phù hợp role
            const role = data.data?.user?.role;
            const defaultPath = getPostLoginPath(role);
            const from = location.state?.from || defaultPath;
            navigate(from, { replace: true });
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Đăng nhập thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard title="Đăng nhập" subtitle="Dành cho Khách hàng và Tài xế">
         <Tabs
            defaultActiveKey="email"
            items={[
               {
                  key: "email",
                  label: "Email",
                  children: (
                     <Form layout="vertical" onFinish={onFinish} className="space-y-2">
                        <Form.Item
                           label="Email"
                           name="email"
                           rules={[{ required: true, message: "Vui lòng nhập email" }]}
                        >
                           <Input placeholder="email@example.com" />
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
                  ),
               },
               {
                  key: "phone",
                  label: "Số điện thoại",
                  children: (
                     <Form layout="vertical" onFinish={onFinish} className="space-y-2">
                        <Form.Item
                           label="Số điện thoại"
                           name="phone"
                           rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                           <Input placeholder="090xxxxxxx" />
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
                  ),
               },
            ]}
         />

         <div className="mt-4 text-center text-sm">
            Chưa có tài khoản? {" "}
            <Link to="/auth/register" className="text-green-700">
               Đăng ký ngay
            </Link>
         </div>
      </AuthCard>
   );
}


