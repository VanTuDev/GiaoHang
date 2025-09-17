import { Navigate, Outlet, useLocation } from "react-router-dom";

function getUser() {
   try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
   } catch {
      return null;
   }
}

export default function RequireAdmin() {
   const location = useLocation();
   const user = getUser();
   const token = localStorage.getItem("accessToken");
   if (!token || !user || user.role !== "Admin") {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
   }
   return <Outlet />;
}


