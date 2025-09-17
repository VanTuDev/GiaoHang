import { Layout, Menu, Button, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../authentication/api/axiosClient";
import { AUTH_ENDPOINTS } from "../../authentication/api/endpoints";

const { Header } = Layout;

export default function AdminHeader() {
   const location = useLocation();
   const navigate = useNavigate();
   const selected = location.pathname.startsWith("/admin/users") ? ["users"] : ["overview"];

   return (
      <Header className="flex items-center justify-between bg-white border-b">
         <Link to="/admin" className="text-lg font-semibold text-green-700">
            Admin Panel
         </Link>
         <Menu
            mode="horizontal"
            selectedKeys={selected}
            className="min-w-0 border-none"
            items={[
               { key: "overview", label: <Link to="/admin">Tổng quan</Link> },
               { key: "users", label: <Link to="/admin/users">Người dùng</Link> },
            ]}
         />
         <Button
            onClick={async () => {
               try {
                  const refreshToken = localStorage.getItem("refreshToken");
                  if (refreshToken) {
                     const res = await axiosClient.post(AUTH_ENDPOINTS.logout, { refreshToken });
                     console.log("[POST /auth/logout]", res.data);
                  }
               } catch (e) {
                  console.error(e);
               } finally {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("authUser");
                  message.success("Đã đăng xuất");
                  navigate("/admin/login", { replace: true });
               }
            }}
         >
            Đăng xuất
         </Button>
      </Header>
   );
}


