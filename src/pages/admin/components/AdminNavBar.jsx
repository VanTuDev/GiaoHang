import React from "react";
import { Layout, Menu, Grid } from "antd";
import {
   UserOutlined,
   CarOutlined,
   BarChartOutlined,
   WarningOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

const AdminNavBar = ({ collapsed, onCollapse }) => {
   const location = useLocation();
   const screens = useBreakpoint();

   return (
      <Sider
         collapsible
         collapsed={collapsed || !screens.md}
         onCollapse={onCollapse}
         breakpoint="md"
         width={220}
         theme="light"
         className="shadow-md"
      >
         <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: "100%", borderRight: 0 }}
         >
            <Menu.Item key="/admin/accounts" icon={<UserOutlined />}>
               <Link to="/admin/accounts">Quản lý tài khoản</Link>
            </Menu.Item>
            <Menu.Item key="/admin/drivers" icon={<CarOutlined />}>
               <Link to="/admin/drivers">Quản lý tài xế</Link>
            </Menu.Item>
            <Menu.Item key="/admin/revenue" icon={<BarChartOutlined />}>
               <Link to="/admin/revenue">Quản lý doanh thu hệ thống</Link>
            </Menu.Item>
            <Menu.Item key="/admin/reports" icon={<WarningOutlined />}>
               <Link to="/admin/reports">Báo cáo vi phạm</Link>
            </Menu.Item>
         </Menu>
      </Sider>
   );
};

export default AdminNavBar;
