// src/components/HybridQRScanner.jsx
import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import API_BASE_URL from "./API";

const HybridQRScanner = () => {
  const [assetDetails, setAssetDetails] = useState(null);
  const [editableStatus, setEditableStatus] = useState("");
  const [scannerType, setScannerType] = useState("hardware");
  const [showModal, setShowModal] = useState(false);

  const cameraRef = useRef(null);
  const hardwareInputRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // Focus hardware input
  useEffect(() => {
    if (scannerType === "hardware" && hardwareInputRef.current) {
      hardwareInputRef.current.focus();
    }
  }, [scannerType, assetDetails, showModal]);

  const fetchAssetDetails = async (serialNumber, category) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/asset/get/${serialNumber}?category=${category}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) throw new Error("Asset not found");

      const data = await res.json();
      setAssetDetails(data);
      setEditableStatus(data.status || "Good Condition");
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setAssetDetails({ error: "Asset not found or server error" });
      setShowModal(true);
    }
  };

  const updateStatus = async () => {
    if (!assetDetails) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/asset/update/${assetDetails.serialNumber}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ status: editableStatus }),
        },
      );

      if (!res.ok) throw new Error("Failed to update status");

      setAssetDetails((prev) => ({ ...prev, status: editableStatus }));
      setShowModal(false);

      if (scannerType === "camera") startCameraScanner();

      toast.success("Asset status updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update asset status");
    }
  };

  // Hardware scanner input handler
  const handleInput = (e) => {
    if (e.key === "Enter") {
      const data = e.target.value.trim();
      e.target.value = "";
      if (!data) return;

      try {
        let parsed;

        // Try parsing as JSON
        if (data.startsWith("{")) {
          parsed = JSON.parse(data);

          if (parsed.serialNumber && !parsed.category) {
            // Only serial number → rental
            window.open(
              `/assets/rentals/details/${parsed.serialNumber}`,
              "_blank",
            );
            return;
          }

          fetchAssetDetails(parsed.serialNumber, parsed.category);
        } else {
          // Plain string → assume rental serial number
          window.open(`/assets/rentals/details/${data}`, "_blank");
        }
      } catch (err) {
        console.error("Invalid QR data (hardware):", err);
        setAssetDetails({ error: "Invalid QR Code" });
        setShowModal(true);
      }
    }
  };
  // Camera scanner
  const startCameraScanner = async () => {
    if (!cameraRef.current) return;

    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
      html5QrCodeRef.current.clear();
    }

    const html5QrCode = new Html5Qrcode("camera-container");
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start({ facingMode: "environment" }, { fps: 10 }, (decodedText) => {
        try {
          if (decodedText.startsWith("{")) {
            const parsed = JSON.parse(decodedText);

            if (parsed.serialNumber && !parsed.category) {
              window.open(
                `/assets/rentals/details/${parsed.serialNumber}`,
                "_blank",
              );
              html5QrCode.stop();
              return;
            }

            fetchAssetDetails(parsed.serialNumber, parsed.category);
          } else {
            // Plain string → rental
            window.open(`/assets/rentals/details/${decodedText}`, "_blank");
            html5QrCode.stop();
          }
        } catch (err) {
          console.error("Invalid QR:", err);
        }
      })
      .catch((err) => console.error("QR start failed:", err));
  };

  // Switch scanner
  useEffect(() => {
    if (scannerType === "camera") {
      startCameraScanner();
    } else if (scannerType === "hardware") {
      if (html5QrCodeRef.current) html5QrCodeRef.current.stop().catch(() => {});
    }
  }, [scannerType]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 p-6 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            DASHBOARD / ASSET SCANNER
          </nav>

          <h2 className="text-3xl font-bold tracking-tight">
            Hybrid QR Scanner
          </h2>

          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Scan physical asset tags to instantly view or update records.
          </p>
        </div>

        {/* Scanner Type Dropdown */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Scanner Type
          </label>

          <select
            value={scannerType}
            onChange={(e) => setScannerType(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="hardware">Handheld USB Scanner</option>
            <option value="camera">Main Camera (Back)</option>
          </select>
        </div>
      </header>

      {/* Scanner Card */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 md:p-8">
            {/* Camera Scanner UI */}
            {scannerType === "camera" && (
              <div className="relative w-full md:aspect- h-[60vh] md:h-auto  rounded-xl overflow-hidden flex items-center justify-center">
                <div
                  id="camera-container"
                  ref={cameraRef}
                  className="absolute inset-0 w-full h-[full] object-cover"
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-white/10 z-20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    Camera Active
                  </span>
                </div>
              </div>
            )}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
              {/* Instant Sync */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg">
                  <span className="material-icons-round">bolt</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Instant Sync</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Data updates in real-time across all active sessions.
                  </p>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                  <span className="material-icons-round">history</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Audit Trail</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Every scan is logged with user timestamp and location.
                  </p>
                </div>
              </div>

              {/* Encrypted */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <span className="material-icons-round">security</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Encrypted</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Secure scanning protocol for proprietary assets.
                  </p>
                </div>
              </div>
            </div>
            {/* Hardware Scanner Hidden Input */}
            {scannerType === "hardware" && (
              <input
                ref={hardwareInputRef}
                onKeyDown={handleInput}
                className="w-0 h-0 opacity-0"
                autoFocus
              />
            )}

            {/* Instruction */}
            <div className="mt-8 text-center">
              <h3 className="font-semibold text-lg">
                {scannerType === "camera"
                  ? "Scan using Camera"
                  : "Scan using Hardware Scanner"}
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Waiting for QR scan input...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {assetDetails?.error ? "Error" : "Asset Details"}
            </h2>

            {assetDetails?.error ? (
              <p className="text-red-500">{assetDetails.error}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>Serial:</strong> {assetDetails.serialNumber}
                </li>
                <li>
                  <strong>Name:</strong> {assetDetails.assetName}
                </li>
                <li>
                  <strong>Category:</strong> {assetDetails.category}
                </li>
                <li>
                  <strong>Status:</strong>
                  <select
                    value={editableStatus}
                    onChange={(e) => setEditableStatus(e.target.value)}
                    className="ml-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-700"
                  >
                    <option value="Good Condition">Good Condition</option>
                    <option value="For Maintenance">For Maintenance</option>
                    <option value="For Disposal">For Disposal</option>
                  </select>
                </li>
              </ul>
            )}

            {!assetDetails?.error && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={updateStatus}
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Save Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridQRScanner;
