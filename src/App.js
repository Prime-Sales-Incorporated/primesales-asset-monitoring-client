import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PrivateRoute from "./context/PrivateRoute";

import MainDashboard from "./admin/pages/dashboard";
import RegisterAsset from "./admin/pages/asset-add";
import TransactionsOffline from "./sample";
import LoginUser from "./user/pages/login";
import LandingPage from "./user/pages/homepage";
import LoginAdmin from "./admin/pages/login";
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

import ReportsAnalytics from "./admin/pages/report";
import InventoryReport from "./admin/pages/reports/inventory-report";
import FinanceReport from "./admin/pages/reports/finance-report";
import Warehouse from "./admin/pages/warehouse/warehouse-stocks";

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

  // Better login detection
  const token = localStorage.getItem("userToken");
  const user = localStorage.getItem("userInfo");
  const isLoggedIn = !!token || !!user;

  // Hide sidebar logic
  const hideSidebar =
    hideSidebarRoutes.includes(location.pathname) ||
    (location.pathname === "/scanner" && !isLoggedIn);

  return (
    <div className="min-h-screen flex">
      {/* DESKTOP SIDEBAR */}
      {!hideSidebar && (
        <div className="hidden lg:block h-screen">
          {" "}
          <Sidebar />{" "}
        </div>
      )}
      {/* MOBILE SIDEBAR */}
      {!hideSidebar && (
        <>
          <div
            className={`fixed top-0 left-0 h-full bg-slate-950 z-50 w-48 transition-transform duration-300 lg:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar />
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* MOBILE HEADER */}
        {!hideSidebar && (
          <div className="lg:hidden flex justify-between items-center p-4 bg-white shadow">
            <button onClick={() => setSidebarOpen(true)} className="text-2xl">
              ☰
            </button>

            <div className="h-10 w-28">
              <img src="/logo.png" alt="Logo" className="h-10" />
            </div>

            <div className="w-6" />
          </div>
        )}

        {/* ROUTES */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <Toaster position="top-right" />

          <Routes>
            {/* WEBSITE ROUTES */}
            <Route path="/home" element={<Home />} />
            <Route path="/solutions" element={<OurSolutions />} />
            <Route path="/main" element={<WebsiteMain />} />

            {/* PUBLIC ROUTES */}
            <Route path="/cam" element={<CameraTest />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginUser />} />
            <Route path="/admin/login" element={<LoginAdmin />} />

            {/* SCANNER */}
            <Route path="/scanner" element={<HybridQRScanner />} />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MainDashboard />
                </PrivateRoute>
              }
            />

            {/* INVENTORY */}
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

            {/* RENTALS */}
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

            {/* WAREHOUSE */}
            <Route
              path="/warehouse"
              element={
                <PrivateRoute>
                  <Warehouse />
                </PrivateRoute>
              }
            />

            {/* DEPRECIATION */}
            <Route
              path="/assets/depreciation"
              element={
                <PrivateRoute>
                  <AssetDepreciationDashboard />
                </PrivateRoute>
              }
            />

            {/* REPORTS */}
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <ReportsAnalytics />
                </PrivateRoute>
              }
            />

            <Route
              path="/reports/inventory"
              element={
                <PrivateRoute>
                  <InventoryReport />
                </PrivateRoute>
              }
            />

            <Route
              path="/reports/finance"
              element={
                <PrivateRoute>
                  <FinanceReport />
                </PrivateRoute>
              }
            />

            {/* ADD ASSET */}
            <Route
              path="/assets/add"
              element={
                <PrivateRoute type="admin">
                  <RegisterAsset />
                </PrivateRoute>
              }
            />

            {/* OFFLINE TRANSACTIONS */}
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
      {" "}
      <AppLayout />{" "}
    </Router>
  );
}

export default App;
