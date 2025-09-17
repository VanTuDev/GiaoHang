import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { Login, Register, VerifyEmail, ForgotPassword, ResetPassword } from "./authentication/pages";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/user/Overview";
import RequireAuth from "./authentication/routes/RequireAuth";
import ProfilePage from "./features/profile/pages/Profile";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminOverview from "./admin/pages/Overview";
import AdminUsers from "./admin/pages/Users";
import AdminLogin from "./admin/pages/Login";
import RequireAdmin from "./admin/routes/RequireAdmin";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#166534", // xanh lá thẫm
          colorInfo: "#166534",
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/verify" element={<VerifyEmail />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />

          {/* App */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

// Placeholder components
const LandingPage = () => <div>Trang chủ</div>;

