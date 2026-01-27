import React, { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Header from "../components/header";
import API_BASE_URL from "../../API";

const AssetDetailsTable = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewQR, setPreviewQR] = useState(null);
  const modalRef = useRef(null);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleEdit = (assetId) => {
    console.log("Edit asset:", assetId);
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/asset/delete/${assetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setAssets((prev) => prev.filter((a) => a._id !== assetId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading assets...
      </div>
    );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark dark:text-gray-300">
      {/* <Header /> */}
      <main className="px-3 py-4">
        <h1 className="text-xl font-semibold mb-3">Asset Details</h1>

        <div className="overflow-x-auto w-full border">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-black/10">
                {[
                  "Asset Name",
                  "Classification",
                  "Description",
                  "Category",
                  "Serial Number",
                  "Purchase Date",
                  "Issued Date",
                  "Issued To",
                  "Status",
                  "Life Span",
                  "Cost",
                  "QR Code", // new column
                  "Actions",
                ].map((h, i) => (
                  <th key={i} className="border p-2 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {assets.map((asset) => (
                <tr key={asset._id} className="hover:bg-black/5">
                  <td className="border p-2">{asset.assetName}</td>
                  <td className="border p-2">{asset.category || "-"}</td>
                  <td className="border p-2">{asset.description || "-"}</td>
                  <td className="border p-2">{asset.category || "-"}</td>
                  <td className="border p-2">{asset.serialNumber || "-"}</td>
                  <td className="border p-2">
                    {asset.purchaseDate
                      ? new Date(asset.purchaseDate).toLocaleDateString("en-PH")
                      : "-"}
                  </td>
                  <td className="border p-2">
                    {asset.issuedDate
                      ? new Date(asset.issuedDate).toLocaleDateString("en-PH")
                      : "-"}
                  </td>
                  <td className="border p-2">{asset.issuedTo || "-"}</td>
                  <td className="border p-2">{asset.status || "-"}</td>
                  <td className="border p-2 text-center">
                    {asset.lifeSpan || "-"}
                  </td>
                  <td className="border p-2 text-right">
                    ₱
                    {Number(asset.assetCost).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  {/* QR Code Column with preview on click */}
                  <td className="border p-2 flex justify-center">
                    {asset.serialNumber ? (
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setPreviewQR(
                            JSON.stringify({
                              serialNumber: asset.serialNumber,
                              category: asset.category || "Uncategorized",
                            }),
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

                  <td className="border p-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => handleEdit(asset._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDelete(asset._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {assets.length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center p-3">
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* QR Preview Modal */}
        {previewQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
              ref={modalRef}
              className="relative bg-white p-6 rounded-lg flex flex-col items-center gap-4"
            >
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

              <p className="mt-2 text-center text-black text-sm font-medium">
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

export default AssetDetailsTable;
