import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PrivateRoute from "./context/PrivateRoute";

import AdminLogin from "./admin/pages/login";
import MainDashboard from "./admin/pages/dashboard";
import RegisterAsset from "./admin/pages/asset-add";
import TransactionsOffline from "./sample";
import RegisterUser from "./user/pages/register";
import LoginUser from "./user/pages/login";
import LandingPage from "./user/pages/homepage";
import LoginAdmin from "./admin/pages/login";
import RegisterAdmin from "./admin/pages/register";
import HybridQRScanner from "./scanner";
import CameraTest from "./cameraTest";
import { Toaster } from "react-hot-toast";
import Home from "./website pages/Home";
import OurSolutions from "./website pages/solutions";
import WebsiteMain from "./website pages/HomePage";
import AssetDepreciationDashboard from "./admin/pages/asset-depr";
import AssetDetailsTable from "./admin/pages/asset-list";
import Sidebar from "./user/components/sidebar";
import AssetInventory from "./admin/pages/inventory-revamp";
import RentalsDashboard from "./admin/pages/rentals";
import PrimeTrackAudit from "./admin/pages/rentals/rental-auditpage";

function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hideSidebarRoutes = [
    "/",
    "/login",
    "/register",
    "/admin/login",
    "/admin/register",
  ];

  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex">
      {/* DESKTOP SIDEBAR */}
      {!hideSidebar && (
        <div className="hidden md:block h-screen">
          <Sidebar />
        </div>
      )}

      {/* MOBILE SIDEBAR DRAWER */}
      {!hideSidebar && (
        <>
          <div
            className={`fixed top-0 left-0 h-full w-64 bg-slate-950 z-50 transition-transform duration-300 md:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar />
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* MOBILE TOP HEADER */}
        {!hideSidebar && (
          <div className="md:hidden flex justify-between items-center p-4 bg-white shadow">
            <button onClick={() => setSidebarOpen(true)} className="text-2xl">
              ☰
            </button>

            <h1 className="font-semibold">PrimeTrack</h1>

            <div className="w-6" />
          </div>
        )}

        {/* ROUTES AREA (SCROLLABLE CONTENT) */}
        <div className="flex-1 overflow-auto  bg-gray-50">
          <Toaster position="top-right" />

          <Routes>
            {/* Website Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/solutions" element={<OurSolutions />} />
            <Route path="/main" element={<WebsiteMain />} />

            {/* Public Routes */}
            <Route path="/cam" element={<CameraTest />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginUser />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="/admin/login" element={<LoginAdmin />} />
            <Route path="/admin/register" element={<RegisterAdmin />} />

            {/* Protected Routes */}
            <Route path="/scanner" element={<HybridQRScanner />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MainDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/inv"
              element={
                <PrivateRoute>
                  <AssetDetailsTable />
                </PrivateRoute>
              }
            />

            <Route
              path="/assets/list"
              element={
                <PrivateRoute>
                  <AssetInventory />
                </PrivateRoute>
              }
            />

            <Route
              path="/assets/rentals"
              element={
                <PrivateRoute>
                  <RentalsDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/assets/rentals/details/:serialNumber"
              element={<PrimeTrackAudit />}
            />

            <Route
              path="/assets/depreciation"
              element={
                <PrivateRoute>
                  <AssetDepreciationDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/assets/add"
              element={
                <PrivateRoute type="admin">
                  <RegisterAsset />
                </PrivateRoute>
              }
            />

            <Route
              path="/trans"
              element={
                <PrivateRoute>
                  <TransactionsOffline />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
