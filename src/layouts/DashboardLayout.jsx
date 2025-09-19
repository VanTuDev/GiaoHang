import { Layout } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import { useAuthState } from "../authentication/hooks/useAuth";
import { useAxiosAuth } from "../authentication/hooks/useAxiosAuth";

const { Header, Content } = Layout;

export default function DashboardLayout() {
   const navigate = useNavigate();
   const { accessToken } = useAuthState();
   // Gắn Authorization header cho tất cả request qua axiosClient
   useAxiosAuth(accessToken);

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


