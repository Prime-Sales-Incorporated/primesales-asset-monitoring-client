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
import ScrollToTop from "./admin/hooks/scrollToTop";
import TenantSelect from "./user/pages/chooseTenant";
import OCSIMainDashboard from "./admin/OCSI/pages/dashboard";
import OCSIAssetDepreciationDashboard from "./admin/OCSI/pages/asset-depr";
import SidebarOCSI from "./user/components/OCSIsidebar";
import OCSIAssetInventory from "./admin/OCSI/pages/inventory-revamp";
import OCSIRentalsDashboard from "./admin/OCSI/pages/rentals";
import OCSIRegisterAsset from "./admin/OCSI/pages/asset-add";
import OCSIReportGenerator from "./admin/OCSI/pages/reports/depreciation-report";
import OCSITrackAudit from "./admin/OCSI/pages/rentals/rental-auditpage";
import OCSIHybridQRScanner from "./admin/OCSI/pages/OCSI-Scanner";

function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hideSidebarRoutes = [
    "/",
    "/tenant",
    "/login",
    "/register",
    "/admin/login",
    "/admin/register",
  ];

  const token = localStorage.getItem("userToken");
  const user = localStorage.getItem("userInfo");
  const isLoggedIn = !!token || !!user;

  const hideSidebar =
    hideSidebarRoutes.includes(location.pathname) ||
    (location.pathname === "/scanner" && !isLoggedIn);

  const isOCSI = location.pathname.startsWith("/ocsi");
  const ActiveSidebar = isOCSI ? SidebarOCSI : Sidebar;

  return (
    <div className="min-h-screen flex">
      <ScrollToTop />

      {/* DESKTOP SIDEBAR */}
      {!hideSidebar && (
        <div className="hidden lg:block h-screen">
          <ActiveSidebar />
        </div>
      )}

      {/* MOBILE SIDEBAR */}
      {/* ActiveSidebar already handles its own fixed positioning, width,
          transform, and backdrop when `mobile` is passed — wrapping it in
          another fixed + translate-x container here creates a nested
          transform context (any element with a `transform` becomes the
          containing block for `position: fixed` descendants), which broke
          the sidebar's own fixed positioning. Not passing `isOpen` also
          meant the sidebar never actually knew it should be open. */}
      {!hideSidebar && (
        <div className="lg:hidden">
          <ActiveSidebar
            mobile
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* MOBILE HEADER */}
        {!hideSidebar && (
          <div className="lg:hidden flex justify-between items-center p-4 bg-white shadow">
            <button onClick={() => setSidebarOpen(true)} className="text-2xl">
              ☰
            </button>
            {/* <div className="h-10 w-28">
              <img src="/logo.png" alt="Logo" className="h-10" />
            </div> */}
            <div className="w-6" />
          </div>
        )}

        {/* ROUTES */}
        <div id="main-scroll" className="flex-1 overflow-auto bg-gray-50">
          <Toaster position="top-right" />

          <Routes>
            {/* WEBSITE ROUTES */}
            <Route path="/home" element={<Home />} />

            {/* PUBLIC ROUTES */}
            <Route path="/cam" element={<CameraTest />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginUser />} />
            <Route path="/admin/login" element={<LoginAdmin />} />

            {/* TENANT SELECT */}
            <Route
              path="/tenant"
              element={
                <PrivateRoute>
                  <TenantSelect />
                </PrivateRoute>
              }
            />

            {/* SCANNER */}
            <Route path="/scanner" element={<HybridQRScanner />} />

            {/* ======================== */}
            {/* PRIME SALES ROUTES       */}
            {/* ======================== */}

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
              element={
                <PrivateRoute>
                  <PrimeTrackAudit />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/assets/rentals/details/:serialNumber"
              element={
                <PrivateRoute>
                  <OCSITrackAudit />
                </PrivateRoute>
              }
            />
            <Route
              path="/warehouse"
              element={
                <PrivateRoute>
                  <Warehouse />
                </PrivateRoute>
              }
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
            <Route
              path="/assets/add"
              element={
                <PrivateRoute>
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

            {/* ======================== */}
            {/* OCSI ROUTES              */}
            {/* ======================== */}

            <Route
              path="/ocsi/dashboard"
              element={
                <PrivateRoute>
                  <OCSIMainDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/ocsi/depreciation"
              element={
                <PrivateRoute>
                  <OCSIAssetDepreciationDashboard />
                </PrivateRoute>
              }
            />

            {/* Placeholder OCSI routes — swap components as you build them */}
            <Route
              path="/ocsi/assets/add"
              element={
                <PrivateRoute>
                  <OCSIRegisterAsset />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/assets/list"
              element={
                <PrivateRoute>
                  <OCSIAssetInventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/assets/depreciation"
              element={
                <PrivateRoute>
                  <OCSIAssetDepreciationDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/assets/rentals"
              element={
                <PrivateRoute>
                  <OCSIRentalsDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/assets/rentals/details/:serialNumber"
              element={
                <PrivateRoute>
                  <PrimeTrackAudit />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/warehouse"
              element={
                <PrivateRoute>
                  <Warehouse />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/reports"
              element={
                <PrivateRoute>
                  <ReportsAnalytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/reports/inventory"
              element={
                <PrivateRoute>
                  <InventoryReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/reports/finance"
              element={
                <PrivateRoute>
                  <FinanceReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/ocsi/scanner"
              element={
                <PrivateRoute>
                  <OCSIHybridQRScanner />
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
