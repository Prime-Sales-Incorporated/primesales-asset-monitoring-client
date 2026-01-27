import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./context/PrivateRoute"; // import your PrivateRoute

import AdminLogin from "./admin/pages/login";
import MainDashboard from "./admin/pages/dashboard";
import AssetsDashboard from "./admin/pages/asset-list";
import RegisterAsset from "./admin/pages/asset-add";
import TransactionsOffline from "./sample";
import RegisterUser from "./user/pages/register";
import LoginUser from "./user/pages/login";
import LandingPage from "./user/pages/homepage";
import AssetScanner from "./user/pages/scanner";
import LoginAdmin from "./admin/pages/login";
import RegisterAdmin from "./admin/pages/register";
import HybridQRScanner from "./scanner";
import CameraTest from "./cameraTest";
import { Toaster } from "react-hot-toast";
import Home from "./website pages/Home";
import Forklift3D from "./forklift3d";
import OurSolutions from "./website pages/solutions";
import WebsiteMain from "./website pages/HomePage";
import AssetDepreciation from "./admin/pages/asset-depreciation";
import AssetDepreciationDashboard from "./admin/pages/asset-depr";
import AssetDetailsTable from "./admin/pages/asset-list";
import Sidebar from "./user/components/sidebar";
import { useLocation } from "react-router-dom";
import AssetInventory from "./admin/pages/inventory-revamp";
function AppLayout() {
  const location = useLocation();

  // routes that should NOT show sidebar
  const hideSidebarRoutes = [
    "/",
    "/login",
    "/register",
    "/admin/login",
    "/admin/register",
  ];

  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {!hideSidebar && <Sidebar />}

      <div className="flex-1">
        <Toaster position="top-right" />

        <Routes>
          {/* Website Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/solutions" element={<OurSolutions />} />
          <Route path="/main" element={<WebsiteMain />} />

          {/* Public routes */}
          <Route path="/cam" element={<CameraTest />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginUser />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin/register" element={<RegisterAdmin />} />

          {/* Protected routes */}
          <Route
            path="/scanner"
            element={
              <PrivateRoute>
                <HybridQRScanner />
              </PrivateRoute>
            }
          />

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
                <AssetInventory />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets/list"
            element={
              <PrivateRoute>
                <AssetDetailsTable />
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
