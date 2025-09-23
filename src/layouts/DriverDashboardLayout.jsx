import React from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
   HomeOutlined,
   IdcardOutlined,
   ShoppingOutlined,
   RadarChartOutlined,
   MessageOutlined,
   PhoneOutlined,
   MenuFoldOutlined,
   MenuUnfoldOutlined,
   LogoutOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function DriverDashboardLayout() {
   const location = useLocation();
   const navigate = useNavigate();
   const selectedKey = location.pathname.split("/").slice(2, 3)[0] || "home";
   const [collapsed, setCollapsed] = React.useState(false);

   const handleLogout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      navigate("/auth/login", { replace: true });
   };

   return (
      <Layout style={{ minHeight: "100vh" }}>
         <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" width={240}
            style={{ borderRight: "1px solid #e5e7eb" }}>
            <div className="px-4 py-4 text-xl font-semibold text-blue-900 flex items-center justify-between">
               <span className={collapsed ? "hidden" : ""}>Tài xế</span>
               <Button
                  size="small"
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
               />
            </div>
            <Menu
               mode="inline"
               selectedKeys={[selectedKey]}
               items={[
                  { key: "home", icon: <HomeOutlined />, label: <Link to="/driver">Trang chủ</Link> },
                  { key: "profile", icon: <IdcardOutlined />, label: <Link to="/driver/profile">Hồ sơ</Link> },
                  { key: "orders", icon: <ShoppingOutlined />, label: <Link to="/driver/orders">Đơn khách</Link> },
                  { key: "status", icon: <RadarChartOutlined />, label: <Link to="/driver/status">Trạng thái</Link> },
                  { key: "chat", icon: <MessageOutlined />, label: <Link to="/driver/chat">Chat với khách hàng</Link> },
                  { key: "contact", icon: <PhoneOutlined />, label: <Link to="/driver/contact">Liên hệ</Link> },
               ]}
            />
            <div className="mt-auto p-3">
               <Button block icon={<LogoutOutlined />} onClick={handleLogout}>
                  {collapsed ? "" : "Đăng xuất"}
               </Button>
            </div>
         </Sider>
         <Layout>
            <Header style={{ background: "#1e3a8a" }}>
               <div className="text-white font-semibold">Bảng điều khiển Tài xế</div>
            </Header>
            <Content style={{ margin: 0 }}>
               <div className="min-h-[calc(100vh-64px)]">{/* không padding/margin, full-width */}
                  <Outlet />
               </div>
            </Content>
         </Layout>
      </Layout>
   );
}


