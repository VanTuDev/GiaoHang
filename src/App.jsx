import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { Login, Register, VerifyEmail, ForgotPassword, ResetPassword } from "./authentication/pages";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/user/Overview";
import RequireAuth from "./authentication/routes/RequireAuth";
import ProfilePage from "./features/profile/pages/Profile";
import Landing from "./components/landing/Landing";
// Admin chuyển sang src/pages/admin/*
import AdminDashBoard from "./pages/admin/AdminDashBoard";
import AdminLogin from "./pages/admin/authentication/AdminLogin";
import AccountsPage from "./pages/admin/outlet/AccountsPage";
import DriversPage from "./pages/admin/outlet/DriversPage";
import RevenuePage from "./pages/admin/outlet/RevenuePage";
import ReportsPage from "./pages/admin/outlet/ReportsPage";

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
          <Route path="/" element={<Landing />} />

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
          <Route path="/admin" element={<AdminDashBoard />}>
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

// Placeholder components

