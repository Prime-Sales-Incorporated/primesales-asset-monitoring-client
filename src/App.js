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

function App() {
  return (
    <Router>
      <Toaster position="top-right" /> {/* Add this once, globally */}
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
        <Route path="/scanner" element={<HybridQRScanner />} />

        <Route
          path="/scanner"
          element={
            <PrivateRoute>
              <AssetScanner />
            </PrivateRoute>
          }
        />
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/assets/list"
          element={
            <PrivateRoute>
              <AssetsDashboard />
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
    </Router>
  );
}

export default App;
