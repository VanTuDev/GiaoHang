import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";

const { Content } = Layout;

export default function AdminLayout() {
   return (
      <Layout className="min-h-screen bg-white">
         <AdminHeader />
         <Content className="p-4">
            <div className="mx-auto max-w-7xl">
               <Outlet />
            </div>
         </Content>
      </Layout>
   );
}


