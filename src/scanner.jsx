// src/components/HybridQRScanner.jsx
import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import Header from "./user/components/header";
import API_BASE_URL from "./API";

const HybridQRScanner = () => {
  const [assetDetails, setAssetDetails] = useState(null);
  const [editableStatus, setEditableStatus] = useState("");
  const [scannerType, setScannerType] = useState("hardware"); // "hardware" or "camera"
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
        }
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
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      setAssetDetails((prev) => ({ ...prev, status: editableStatus }));

      setShowModal(false);

      if (scannerType === "camera") startCameraScanner();

      // ✅ Show success toast
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
        const parsed = JSON.parse(data);
        fetchAssetDetails(parsed.serialNumber, parsed.category);
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

    // Stop previous scanner if exists
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
      html5QrCodeRef.current.clear(); // free camera
    }

    const html5QrCode = new Html5Qrcode("camera-container");
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start({ facingMode: "environment" }, { fps: 10 }, (decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);
          fetchAssetDetails(parsed.serialNumber, parsed.category);
          html5QrCode.stop(); // stop after scan
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
      // stop camera if switching back
      if (html5QrCodeRef.current) html5QrCodeRef.current.stop().catch(() => {});
    }
  }, [scannerType]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <div className="flex flex-col items-center  min-h-screen p-4 bg-background-light dark:bg-background-dark">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
          Hybrid QR Scanner
        </h1>

        <div className="mb-4">
          <label className="mr-2 text-black dark:text-white">Type:</label>
          <select
            value={scannerType}
            onChange={(e) => setScannerType(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="hardware"> Scanner</option>
            <option value="camera">Camera </option>
          </select>
        </div>

        {scannerType === "camera" && (
          <div
            id="camera-container"
            ref={cameraRef}
            className="w-full max-w-sm h-64"
          />
        )}

        {scannerType === "hardware" && (
          <input
            ref={hardwareInputRef}
            onKeyDown={handleInput}
            className="w-0 h-0 opacity-0"
            autoFocus
          />
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>

              <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                {assetDetails?.error ? "Error" : "Asset Details"}
              </h2>

              {assetDetails?.error ? (
                <p className="text-red-500">{assetDetails.error}</p>
              ) : (
                <ul className="space-y-2 text-black dark:text-white text-sm">
                  <li>
                    <strong>Serial Number:</strong> {assetDetails.serialNumber}
                  </li>
                  <li>
                    <strong>Asset Name:</strong> {assetDetails.assetName}
                  </li>
                  <li>
                    <strong>Category:</strong> {assetDetails.category}
                  </li>
                  <li>
                    <strong>Issued to:</strong> {assetDetails.issuedTo}
                  </li>
                  <li>
                    <strong>Description:</strong> {assetDetails.description}
                  </li>
                  <li>
                    <strong>Purchase Date:</strong>{" "}
                    {assetDetails?.purchaseDate
                      ? new Date(assetDetails.purchaseDate).toLocaleDateString(
                          "en-PH"
                        )
                      : "N/A"}
                  </li>
                  <li>
                    <strong>Issued Date:</strong>{" "}
                    {assetDetails?.purchaseDate
                      ? new Date(assetDetails.issuedDate).toLocaleDateString(
                          "en-PH"
                        )
                      : "N/A"}
                  </li>
                  <li>
                    <strong>Status:</strong>
                    <select
                      value={editableStatus}
                      onChange={(e) => setEditableStatus(e.target.value)}
                      className="ml-2 px-2 py-1 border rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                    >
                      <option value="Good Condition">Good Condition</option>
                      <option value="For Maintenance">For Maintenance</option>
                      <option value="For Disposal">For Disposal</option>
                    </select>
                  </li>
                </ul>
              )}

              {!assetDetails?.error && (
                <div className="mt-4 flex justify-end">
                  <button
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    onClick={updateStatus}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridQRScanner;
