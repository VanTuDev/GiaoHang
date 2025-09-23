import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useLocalUser from "../../authentication/hooks/useLocalUser";
import UserDropdown from "../dropdown/UserDropdown";
import UserInfoModal from "../modal/UserInfoModal";

const { Header } = Layout;

export default function AppHeader() {
   const location = useLocation();
   const navigate = useNavigate();
   const user = useLocalUser();
   const [infoOpen, setInfoOpen] = React.useState(false);

   const selected = location.pathname.startsWith("/dashboard/users")
      ? ["users"]
      : location.pathname.startsWith("/dashboard/profile")
         ? ["profile"]
         : ["home"];

   const menuItems = [];

   const handleLogout = async () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
      navigate("/auth/login", { replace: true });
   };

   return (
      <Header className="flex items-center justify-between bg-white border-b" style={{ padding: 0, position: 'sticky', top: 0, zIndex: 100, height: 64 }}>
         <Link to="/dashboard" className="text-lg font-semibold text-blue-700">
            <div className="flex items-center gap-2">
               <img className="h-10 ml-5" src="/imgs/logonen.png" alt="Bengo logo" />
            </div>
         </Link>
         <Menu mode="horizontal" selectedKeys={selected} className="min-w-0 border-none" items={menuItems} />
         <div className="flex items-center gap-3">
            <UserDropdown
               user={user}
               onInfo={() => setInfoOpen(true)}
               onSettings={() => navigate("/dashboard/profile")}
               onLogout={handleLogout}
            />
            <UserInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} user={user} />
         </div>
      </Header>
   );
}


