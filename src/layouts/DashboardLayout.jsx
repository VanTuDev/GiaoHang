import { Layout, Modal } from "antd";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";

const { Header, Content } = Layout;

export default function DashboardLayout() {
   const selected = location.pathname.startsWith("/dashboard/users")
      ? ["users"]
      : ["home"];

   return (
      <Layout className="min-h-screen bg-white">
         <AppHeader />
         <Content className="p-4">
            <div className="mx-auto max-w-7xl">
               <Outlet />
            </div>
         </Content>
      </Layout>
   );
}


