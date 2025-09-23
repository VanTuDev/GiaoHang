import { Navigate, Outlet, useLocation } from "react-router-dom";

function getUser() {
   try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
   } catch (_) {
      return null;
   }
}

export default function RequireDriver() {
   const location = useLocation();
   const token = localStorage.getItem("accessToken");
   const user = getUser();

   if (!token) {
      return <Navigate to="/driver/login" replace state={{ from: location.pathname }} />;
   }

   if (!user || user.role !== "Driver") {
      return <Navigate to="/auth/login" replace />;
   }

   return <Outlet />;
}


