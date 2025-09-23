import { Layout, Menu } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import { useAuthState } from "../authentication/hooks/useAuth";
import { useAxiosAuth } from "../authentication/hooks/useAxiosAuth";
import {
   HomeOutlined,
   CarOutlined,
   ShoppingCartOutlined,
   MessageOutlined,
   PhoneOutlined,
} from "@ant-design/icons";

const { Sider, Content, Footer } = Layout;

export default function DashboardLayout() {
   const navigate = useNavigate();
   const location = useLocation();
   const [collapsed, setCollapsed] = useState(false);
   const { accessToken } = useAuthState();
   // Gắn Authorization header cho tất cả request qua axiosClient
   useAxiosAuth(accessToken);

   return (
      <Layout className="min-h-screen bg-white">
         <AppHeader />
         <Layout style={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
            <Sider
               collapsible
               collapsed={collapsed}
               onCollapse={setCollapsed}
               breakpoint="lg"
               collapsedWidth={64}
               className="bg-white"
               width={240}
               style={{ position: "sticky", top: 64, height: "calc(100vh - 64px)", overflow: "auto" }}
            >
               <Menu
                  mode="inline"
                  selectedKeys={[location.pathname]}
                  onClick={({ key }) => navigate(key)}
                  items={[
                     { key: "/dashboard", icon: <HomeOutlined />, label: "Trang chủ" },
                     { key: "/dashboard/book", icon: <CarOutlined />, label: "Thuê vận chuyển" },
                     { key: "/dashboard/orders", icon: <ShoppingCartOutlined />, label: "Đơn hàng" },
                     { key: "/dashboard/chat", icon: <MessageOutlined />, label: "Chat với tài xế" },
                     { key: "/dashboard/contact", icon: <PhoneOutlined />, label: "Liên hệ" },
                  ]}
               />
            </Sider>
            <Layout style={{ overflow: "hidden" }}>
               <Content style={{ height: "calc(100vh - 64px - 40px)", overflow: "auto" }}>
                  <Outlet />
               </Content>
               <Footer style={{ textAlign: 'center', padding: 0, height: 40, lineHeight: "40px", position: "sticky", bottom: 0 }}>
                  © {new Date().getFullYear()} Bengo — Kết nối tài xế và khách hàng
               </Footer>
            </Layout>
         </Layout>
      </Layout>
   );
}


