import { useState } from "react";
import { Form, Input, message } from "antd";
import AuthCard from "../components/AuthCard";
import SubmitButton from "../components/SubmitButton";
import OTPInput from "../components/OTPInput";
import axiosClient from "../api/axiosClient";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function VerifyEmail() {
   const [loading, setLoading] = useState(false);
   const [code, setCode] = useState("");
   const location = useLocation();
   const navigate = useNavigate();

   const onFinish = async (values) => {
      setLoading(true);
      try {
         const payload = { email: values.email, code };
         const { data } = await axiosClient.post(AUTH_ENDPOINTS.verifyEmail, payload);
         if (data?.success) {
            message.success("Xác thực email thành công");
            navigate("/auth/login");
         }
      } catch (e) {
         message.error(e?.response?.data?.message || "Xác thực thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <AuthCard title="Xác thực email" subtitle="Nhập OTP đã gửi về email">
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

            <div className="flex items-center justify-between">
               <Link to="/auth/login" className="text-green-700">
                  Quay lại đăng nhập
               </Link>
               <SubmitButton loading={loading} disabled={code.length < 6}>
                  Xác thực
               </SubmitButton>
            </div>
         </Form>
      </AuthCard>
   );
}


