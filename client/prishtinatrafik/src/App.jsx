// client/src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import TicketsPage from "./pages/TicketsPage";
import RidesPage from "./pages/RidesPage";
import WalletPage from "./pages/WalletPage";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Inspector from "./pages/Inspector";
import DriverLogin from "./pages/Driver/DriverLogin";
import DriverDashboard from "./pages/Driver/DriverDashboard";
import DriverLayout from "./components/layout/DriverLayout";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
};
const DriverProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user?.role === "driver" ? (
    <Outlet />
  ) : (
    <Navigate to="/driver/login" replace />
  );
};
const InspectorRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user?.role === "inspector" || user?.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const [showRoutesPanel, setShowRoutesPanel] = useState(false);
  const [showBusStops, setShowBusStops] = useState(false);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <AppLayout
              onShowRoutes={() => setShowRoutesPanel(true)}
              onShowStops={() => setShowBusStops(!showBusStops)}
              showStops={showBusStops}
            />
          }
        >
          <Route
            path="/"
            element={
              <Home
                showRoutesPanel={showRoutesPanel}
                setShowRoutesPanel={setShowRoutesPanel}
                showBusStops={showBusStops}
                setShowBusStops={setShowBusStops}
              />
            }
          />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/rides" element={<RidesPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route element={<InspectorRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/inspector" element={<Inspector />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="/driver/login" element={<DriverLogin />} />

      <Route element={<DriverProtectedRoute />}>
        <Route element={<DriverLayout />}>
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
