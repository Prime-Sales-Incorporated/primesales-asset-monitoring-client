// src/components/HybridQRScanner.jsx
import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_BASE_URL from "./API";
import db from "../src/offline/db";

const HybridQRScanner = () => {
  const navigate = useNavigate();

  const [assetDetails, setAssetDetails] = useState(null);
  const [editableStatus, setEditableStatus] = useState("");
  const [scannerType, setScannerType] = useState("hardware");
  const [showModal, setShowModal] = useState(false);

  const cameraRef = useRef(null);
  const hardwareInputRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (scannerType === "hardware" && hardwareInputRef.current) {
      hardwareInputRef.current.focus();
    }
  }, [scannerType, assetDetails, showModal]);

  // Fully decode percent-encoding until stable
  // Fixes %26 → &, %20 → space, %22 → " so JSON.parse works correctly
  const fullyDecode = (str) => {
    let decoded = str;
    try {
      let prev = "";
      while (prev !== decoded) {
        prev = decoded;
        decoded = decodeURIComponent(decoded.replace(/\+/g, " "));
      }
    } catch {}
    return decoded;
  };

  // Parse QR content:
  // - Plain serial (no JSON)      → { serialNumber, category: null } → rental
  // - JSON with category          → { serialNumber, category }       → regular asset
  // - JSON without category       → { serialNumber, category: null } → rental
  const parseQR = (raw) => {
    const decoded = fullyDecode(raw.trim());

    try {
      if (decoded.startsWith("{")) {
        const parsed = JSON.parse(decoded);
        if (parsed.serialNumber) {
          return {
            serialNumber: parsed.serialNumber.trim(),
            category: parsed.category ? parsed.category.trim() : null,
          };
        }
      }
    } catch {}

    // Plain string → rental
    return {
      serialNumber: decoded.trim(),
      category: null,
    };
  };

  const fetchAssetDetails = async (serialNumber, category) => {
    try {
      let data = null;

      if (navigator.onLine) {
        const categoryParam = encodeURIComponent(category.trim());
        const res = await fetch(
          `${API_BASE_URL}/api/asset/get/${encodeURIComponent(serialNumber)}?category=${categoryParam}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) throw new Error("Asset not found");
        data = await res.json();

        // Cache for offline use
        await db.assets.put(data);
      } else {
        data = await db.assets.get(serialNumber);
      }

      if (!data) throw new Error("Asset not found");

      setAssetDetails(data);
      setEditableStatus(data.status || "Good Condition");
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setAssetDetails({ error: "Asset not found or server error" });
      setShowModal(true);
    }
  };

  // Central routing: decide redirect or modal based on QR content
  const handleScan = (raw) => {
    if (!raw) return;
    const { serialNumber, category } = parseQR(raw);
    if (!serialNumber) return;

    if (!category) {
      // No category → rental → redirect to audit page
      navigate(`/assets/rentals/details/${encodeURIComponent(serialNumber)}`);
    } else {
      // Has category → regular asset → fetch and show modal
      fetchAssetDetails(serialNumber, category);
    }
  };

  const updateStatus = async () => {
    if (!assetDetails) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/asset/update/${assetDetails.serialNumber}`,
        {
          method: "PUT",
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

  // Hardware scanner — fires on Enter
  const handleInput = (e) => {
    if (e.key !== "Enter") return;
    const raw = e.target.value;
    e.target.value = "";
    handleScan(raw);
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
        html5QrCode.stop().catch(() => {});
        handleScan(decodedText);
      })
      .catch((err) => console.error("QR start failed:", err));
  };

  useEffect(() => {
    if (scannerType === "camera") {
      startCameraScanner();
    } else {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
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
            {/* Camera UI */}
            {scannerType === "camera" && (
              <div className="relative w-full h-[60vh] md:h-auto rounded-xl overflow-hidden flex items-center justify-center">
                <div
                  id="camera-container"
                  ref={cameraRef}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-white/10 z-20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    Camera Active
                  </span>
                </div>
              </div>
            )}

            {/* Feature badges */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
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

            {/* Hardware hidden input */}
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
                Waiting for QR scan input…
              </p>
              <div className="flex justify-center gap-6 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                  Plain serial → Rental audit page
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  JSON with category → Asset detail modal
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-background-light dark:bg-background-dark w-full max-w-xl rounded-xl shadow-2xl overflow-auto border h-screen border-slate-200 dark:border-slate-800 relative">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    inventory_2
                  </span>
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">
                  {assetDetails?.error ? "Error" : "Asset Details"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            {/* Content */}
            <div className="p-6 space-y-6">
              {assetDetails?.error ? (
                <p className="text-red-500 text-sm">{assetDetails.error}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Serial */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                          qr_code
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          Serial Number
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 text-base font-medium">
                          {assetDetails?.serialNumber}
                        </span>
                      </div>
                    </div>

                    {/* Category + Asset Name */}
                    <div className="flex gap-4">
                      <div className="flex items-start w-full gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="hidden md:block bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                            category
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            Category
                          </span>
                          <span className="text-slate-900 text-[16px] dark:text-slate-100 font-medium">
                            {assetDetails?.category}
                          </span>
                        </div>
                      </div>
                      <div className="md:col-span-2 w-full flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="hidden md:block bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                            laptop_mac
                          </span>
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            Asset Name
                          </span>
                          <span className="text-slate-900 dark:text-slate-100 text-base font-medium">
                            {assetDetails?.assetName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Issued To + Cost */}
                    <div className="flex gap-4">
                      <div className="w-full flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="hidden md:block bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                            person
                          </span>
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            Issued To
                          </span>
                          <span className="text-slate-900 dark:text-slate-100 text-base font-medium">
                            {assetDetails?.issuedTo || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="w-full flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="hidden md:block bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                            payments
                          </span>
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            Cost
                          </span>
                          <span className="text-slate-900 dark:text-slate-100 text-base font-medium">
                            {assetDetails?.assetCost
                              ? `₱ ${Number(assetDetails.assetCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Purchase Date */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                          calendar_today
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          Purchase Date
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 text-base font-medium">
                          {assetDetails?.purchaseDate
                            ? new Date(
                                assetDetails.purchaseDate,
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Issue Date */}
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                          calendar_today
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          Issue Date
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 text-base font-medium">
                          {assetDetails?.issuedDate
                            ? new Date(
                                assetDetails.issuedDate,
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                      Current Status
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-primary">
                          check_circle
                        </span>
                      </div>
                      <select
                        value={editableStatus}
                        onChange={(e) => setEditableStatus(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
                      >
                        <option value="Good Condition">Good Condition</option>
                        <option value="For Maintenance">For Maintenance</option>
                        <option value="For Disposal">For Disposal</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      Update the operational status of this equipment for
                      inventory tracking.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!assetDetails?.error && (
              <footer className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateStatus}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-lg transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    save
                  </span>
                  Save Changes
                </button>
              </footer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HybridQRScanner;
