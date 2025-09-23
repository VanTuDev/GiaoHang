import { useState } from "react";
import { Form, Input, Tabs, Typography, message } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthState } from "../../authentication/hooks/useAuth";
import axiosClient from "../../authentication/api/axiosClient";
import { AUTH_ENDPOINTS } from "../../authentication/api/endpoints";
import { getPostLoginPath } from "../../utils/navigation";
import DriverAuthCard from "./components/DriverAuthCard";
import DriverSubmitButton from "./components/DriverSubmitButton";

export default function DriverLogin() {
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
            // Lưu session
            saveSession(data.data);
            const role = data.data?.user?.role;
            if (role !== "Driver") {
               message.warning("Tài khoản không phải Tài xế. Vui lòng dùng đăng nhập thông thường.");
            }
            const defaultPath = getPostLoginPath(role);
            const from = location.state?.from || defaultPath;
            message.success("Đăng nhập tài xế thành công");
            navigate(from, { replace: true });
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Đăng nhập thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <DriverAuthCard title="Đăng nhập tài xế" subtitle="Chỉ dành cho lái xe đã được duyệt">
         <Tabs
            className="auth-tabs-blue"
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
                           tooltip="Bạn có thể đăng nhập bằng Email hoặc Số điện thoại"
                           rules={[
                              {
                                 validator: (_, value) => {
                                    return new Promise((resolve, reject) => {
                                       // Nếu chọn tab Email, yêu cầu có email
                                       if (value) resolve();
                                       else reject("Vui lòng nhập email");
                                    });
                                 },
                              },
                           ]}
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
                           <Link to="/auth/forgot" className="text-blue-900">
                              Quên mật khẩu?
                           </Link>
                           <DriverSubmitButton loading={loading}>Đăng nhập</DriverSubmitButton>
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
                           <Link to="/auth/forgot" className="text-blue-900">
                              Quên mật khẩu?
                           </Link>
                           <DriverSubmitButton loading={loading}>Đăng nhập</DriverSubmitButton>
                        </div>
                     </Form>
                  ),
               },
            ]}
         />

         <div className="mt-4 text-center text-sm">
            Chưa có tài khoản? {" "}
            <Link to="/auth/register" className="text-blue-900">
               Đăng ký ngay
            </Link>
         </div>
         <div className="mt-2 text-center text-sm">
            Không phải tài xế? {" "}
            <Link to="/auth/login" className="text-green-700">
               Đăng nhập khách hàng
            </Link>
         </div>
      </DriverAuthCard>
   );
}


