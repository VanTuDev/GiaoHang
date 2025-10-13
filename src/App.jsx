import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme, App as AntApp } from "antd";
import { Login, Register, VerifyEmail, ForgotPassword, ResetPassword } from "./authentication/pages";
import DashboardLayout from "./layouts/DashboardLayout";
import DriverLogin from "./pages/driver/DriverLogin";
import Overview from "./pages/user/Overview";
import RequireAuth from "./authentication/routes/RequireAuth";
import RequireDriver from "./authentication/routes/RequireDriver";
import ProfilePage from "./features/profile/pages/Profile";
import Landing from "./components/landing/Landing";
// Admin chuyển sang src/pages/admin/*
import AdminDashBoard from "./pages/admin/AdminDashBoard";
import AdminLogin from "./pages/admin/authentication/AdminLogin";
import AccountsPage from "./pages/admin/outlet/AccountsPage";
import DriversPage from "./pages/admin/outlet/DriversPage";
import RevenuePage from "./pages/admin/outlet/RevenuePage";
import ReportsPage from "./pages/admin/outlet/ReportsPage";
import VehiclesBrowser from "./pages/user/VehiclesBrowser";
import OrderCreate from "./pages/user/OrderCreate";
import BookVehicles from "./pages/user/BookVehicles";
import Feedback from "./pages/user/Feedback";
import Reports from "./pages/user/Reports";
import Chat from "./pages/user/Chat";
import Contact from "./pages/user/Contact";
import Orders from "./pages/user/Orders";
import DriverDashboardLayout from "./layouts/DriverDashboardLayout";
import DriverHome from "./pages/driver/Home";
import DriverProfile from "./pages/driver/Profile";
import DriverOrders from "./pages/driver/Orders";
import DriverChat from "./pages/driver/Chat";
import DriverContact from "./pages/driver/Contact";
import DriverRevenue from "./pages/driver/Revenue";
import VehicleManagement from "./pages/driver/VehicleManagement";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1e40af", // xanh dương thẫm
          colorInfo: "#3b82f6", // xanh dương nhạt
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />

            {/* Auth */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/verify" element={<VerifyEmail />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />
            <Route path="/auth/reset" element={<ResetPassword />} />

            {/* Driver */}
            <Route path="/driver/login" element={<DriverLogin />} />

            {/* App */}
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="orders" element={<Orders />} />
                <Route path="feedback" element={<Feedback />} />
                <Route path="reports" element={<Reports />} />
                <Route path="chat" element={<Chat />} />
                <Route path="contact" element={<Contact />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="vehicles" element={<VehiclesBrowser />} />
                <Route path="book" element={<BookVehicles />} />
                <Route path="order-create" element={<OrderCreate />} />
              </Route>
            </Route>

            {/* Driver Dashboard */}
            <Route element={<RequireDriver />}>
              <Route path="/driver" element={<DriverDashboardLayout />}>
                <Route index element={<DriverHome />} />
                <Route path="profile" element={<DriverProfile />} />
                <Route path="orders" element={<DriverOrders />} />
                <Route path="revenue" element={<DriverRevenue />} />
                <Route path="vehicles" element={<VehicleManagement />} />
                <Route path="chat" element={<DriverChat />} />
                <Route path="contact" element={<DriverContact />} />
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
      </AntApp>
    </ConfigProvider>
  );
}