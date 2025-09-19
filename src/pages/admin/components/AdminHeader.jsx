import React from "react";
import { Layout, Avatar, Dropdown, Space } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

const { Header } = Layout;

export const AdminHeader = () => {
   const menuItems = [
      {
         key: "logout",
         label: (
            <div className="flex items-center gap-2">
               <LogoutOutlined /> Đăng xuất
            </div>
         ),
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
