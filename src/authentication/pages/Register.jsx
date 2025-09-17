import { useState } from "react";
import { Form, Input, Select, message } from "antd";
import AuthCard from "../components/AuthCard";
import SubmitButton from "../components/SubmitButton";
import axiosClient from "../api/axiosClient";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const onFinish = async (values) => {
      setLoading(true);
      try {
         const { data } = await axiosClient.post(AUTH_ENDPOINTS.register, values);
         if (data?.success) {
            message.success("Đăng ký thành công, vui lòng xác thực email");
            navigate("/auth/verify", { state: { email: values.email } });
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Đăng ký thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard title="Đăng ký" subtitle="Tạo tài khoản mới">
         <Form layout="vertical" onFinish={onFinish} className="space-y-2">
            <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
               <Input placeholder="Nguyen Van A" />
            </Form.Item>

            <Form.Item label="Email" name="email">
               <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
               <Input placeholder="090xxxxxxx" />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
               <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item label="Vai trò" name="role" initialValue="Customer">
               <Select
                  options={[
                     { value: "Customer", label: "Khách hàng" },
                     { value: "Driver", label: "Tài xế" },
                  ]}
               />
            </Form.Item>

            <div className="flex items-center justify-between">
               <Link to="/auth/login" className="text-green-700">
                  Đã có tài khoản? Đăng nhập
               </Link>
               <SubmitButton loading={loading}>Đăng ký</SubmitButton>
            </div>
         </Form>
      </AuthCard>
   );
}


