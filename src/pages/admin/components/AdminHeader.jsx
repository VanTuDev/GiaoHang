import React from "react";
import { Layout, Avatar, Dropdown, Space, message } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../authentication/api/authService";

const { Header } = Layout;

export const AdminHeader = () => {
   const navigate = useNavigate();

   const handleLogout = async () => {
      try {
         const refreshToken = localStorage.getItem("refreshToken");
         if (refreshToken) {
            try {
               await authService.logout(refreshToken);
            } catch (e) {
               // ignore API error on logout, proceed to clear client state
            }
         }
      } finally {
         localStorage.removeItem("accessToken");
         localStorage.removeItem("refreshToken");
         message.success("Đã đăng xuất");
         navigate("/auth/login", { replace: true });
      }
   };

   const menuItems = [
      {
         key: "logout",
         label: (
            <div className="flex items-center gap-2">
               <LogoutOutlined /> Đăng xuất
            </div>
         ),
         onClick: handleLogout,
      },
   ];

   return (
      <Header className="bg-green-700 text-white px-6 flex items-center justify-between">
         <div className="text-lg font-semibold">Admin Dashboard</div>
         <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Space className="cursor-pointer">
               <Avatar icon={<UserOutlined />} />
               <span>Admin</span>
            </Space>
         </Dropdown>
      </Header>
   );
};
