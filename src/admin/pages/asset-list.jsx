import React, { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import API_BASE_URL from "../../API";

const AssetsDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewQR, setPreviewQR] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/asset/get/all`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setAssets(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // Close modal if click outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setPreviewQR(null);
    }
  };

  useEffect(() => {
    if (previewQR) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [previewQR]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen text-slate-700 dark:text-slate-300">
        Loading assets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 bg-background-light dark:bg-background-dark min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Assets
            </h1>
            <Link to="/assets/add">
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                <span className="material-symbols-outlined text-base">
                  {" "}
                  add{" "}
                </span>
                <span>Add New Asset</span>
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Serial Number
                  </th>
                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Asset Name
                  </th>

                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Description
                  </th>
                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Category
                  </th>

                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Issued Date
                  </th>
                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Issued To
                  </th>
                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-3 font-semibold text-black dark:text-white">
                    QR Code
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {assets.map((asset) => (
                  <tr
                    key={asset._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <td className="px-6 py-3 text-black/70 dark:text-white/70">
                      {asset.serialNumber || "-"}
                    </td>
                    <td className="px-6 py-3 text-black dark:text-white font-medium">
                      {asset.assetName}
                    </td>

                    <td className="px-6 py-3 text-black/70 dark:text-white/70">
                      {asset.description || "-"}
                    </td>
                    <td className="px-6 py-3 text-black/70 dark:text-white/70">
                      {asset.category || "-"}
                    </td>

                    <td className="px-6 py-3 text-black/70 dark:text-white/70">
                      {asset.purchaseDate
                        ? new Date(asset.purchaseDate).toLocaleDateString(
                            "en-PH"
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-3 text-black/70 dark:text-white/70">
                      {asset.issuedDate
                        ? new Date(asset.issuedDate).toLocaleDateString("en-PH")
                        : "-"}
                    </td>

                    <td className="px-6 py-3 text-black/70 dark:text-white/70">
                      {asset.issuedTo || "-"}
                    </td>
                    <td className="px-6 py-3 text-black/70 dark:text-white/70">
                      {asset.status || "-"}
                    </td>
                    <td className="px-6 py-3">
                      {asset.serialNumber ? (
                        <div
                          className="cursor-pointer inline-block bg-white"
                          onClick={() =>
                            setPreviewQR(
                              JSON.stringify({
                                serialNumber: asset.serialNumber,
                                category: asset.category || "Uncategorized",
                              })
                            )
                          }
                        >
                          <QRCodeCanvas
                            value={JSON.stringify({
                              serialNumber: asset.serialNumber,
                              category: asset.category || "Uncategorized",
                            })}
                            size={50}
                            bgColor="white"
                            fgColor="#000000"
                            level="H"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No QR</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Preview Modal */}
        {/* QR Preview Modal */}
        {previewQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
              ref={modalRef}
              className="relative bg-white  p-6 rounded-lg flex flex-col items-center gap-4"
            >
              {/* X button */}
              <button
                className="absolute top-0 right-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold"
                onClick={() => setPreviewQR(null)}
              >
                ×
              </button>

              <QRCodeCanvas
                value={previewQR}
                size={200}
                bgColor="white"
                fgColor="#000000"
                level="H"
              />

              {/* ✅ Serial number below the QR */}
              <p className="mt-2 text-center text-black  text-sm font-medium">
                Serial Number:{" "}
                <span className="font-semibold">
                  {JSON.parse(previewQR).serialNumber}
                </span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssetsDashboard;
