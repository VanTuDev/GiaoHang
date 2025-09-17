import { Navigate, Outlet, useLocation } from "react-router-dom";

function getAccessToken() {
   return localStorage.getItem("accessToken");
}

export default function RequireAuth() {
   const location = useLocation();
   const token = getAccessToken();
   if (!token) {
      return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
   }
   return <Outlet />;
}


