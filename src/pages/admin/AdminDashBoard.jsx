import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import { AdminHeader } from "./components/AdminHeader";
import AdminNavBar from "./components/AdminNavBar";

const { Content } = Layout;

const AdminDashBoard = () => {
   // Trạng thái thu gọn sidebar để phù hợp màn hình nhỏ
   const [collapsed, setCollapsed] = useState(false);

   return (
      <Layout className="min-h-screen bg-gray-50">
         <AdminHeader />
         <Layout className="min-h-[calc(100vh-64px)]">
            <AdminNavBar collapsed={collapsed} onCollapse={setCollapsed} />
            <Layout className="p-1 md:p-6">
               <Content className="bg-white rounded-md shadow-sm p-4 md:p-6 min-h-[60vh] overflow-auto">
                  <div className="mx-auto w-full max-w-7xl">
                     <Outlet />
                  </div>
               </Content>
            </Layout>
         </Layout>
      </Layout>
   );
};

export default AdminDashBoard;
