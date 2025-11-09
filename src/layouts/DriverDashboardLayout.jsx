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
   BarChartOutlined,
   MenuFoldOutlined,
   MenuUnfoldOutlined,
   LogoutOutlined,
   CarOutlined,
   DollarOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content, Footer } = Layout;

export default function DriverDashboardLayout() {
   const location = useLocation();
   const navigate = useNavigate();
   const selectedKey = location.pathname.split("/").slice(2, 3)[0] || "home";
   const [collapsed, setCollapsed] = React.useState(false);
   const [isMobile, setIsMobile] = React.useState(false);

   const handleLogout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      navigate("/auth/login", { replace: true });
   };

   return (
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
         <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            theme="light"
            width={240}
            breakpoint="lg"
            collapsedWidth={isMobile ? 0 : 64}
            onBreakpoint={(broken) => {
               setIsMobile(broken);
               setCollapsed(broken);
            }}
            style={{
               borderRight: "1px solid #e5e7eb",
               position: isMobile ? "fixed" : "sticky",
               top: 0,
               left: 0,
               height: "100vh",
               overflow: "auto",
               zIndex: 200,
            }}
         >
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
                  { key: "vehicles", icon: <CarOutlined />, label: <Link to="/driver/vehicles">Quản lý xe & Trạng thái</Link> },
                  { key: "revenue", icon: <BarChartOutlined />, label: <Link to="/driver/revenue">Doanh thu</Link> },
                  { key: "withdrawal", icon: <DollarOutlined />, label: <Link to="/driver/withdrawal">Rút tiền</Link> },
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
         <Layout style={{ height: "100vh" }}>
            <Header style={{ background: "#1e3a8a", position: "sticky", top: 0, zIndex: 150 }}>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Button
                        type="text"
                        onClick={() => setCollapsed((c) => !c)}
                        icon={collapsed ? <MenuUnfoldOutlined style={{ color: "#fff" }} /> : <MenuFoldOutlined style={{ color: "#fff" }} />}
                     />
                     <div className="text-white font-semibold">Bảng điều khiển Tài xế</div>
                  </div>
                  <div />
               </div>
            </Header>
            <Content style={{ margin: 0, height: "calc(100vh - 64px)", overflow: "auto" }}>
               <div className="min-h-[calc(100vh-64px)] p-4">
                  <Outlet />
               </div>
            </Content>
            <Footer style={{ padding: 8, textAlign: "center", position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #e5e7eb" }}>
               © {new Date().getFullYear()} GiaoHangDaNang
            </Footer>
         </Layout>

         {/* Overlay cho mobile khi mở sidebar */}
         {isMobile && !collapsed ? (
            <div
               onClick={() => setCollapsed(true)}
               className="fixed inset-0 bg-black/30 lg:hidden"
               style={{ zIndex: 100 }}
            />
         ) : null}
      </Layout>
   );
}