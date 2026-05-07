import React, { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import API_BASE_URL from "../../API";

const statusStyles = {
  "Good Condition": "bg-green-100 text-green-800",
  "For Maintenance": "bg-yellow-100 text-yellow-800",
  Condemned: "bg-red-100 text-red-800",
};

const ITEMS_PER_PAGE = 5;

const AssetDetailsTable = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewQR, setPreviewQR] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const modalRef = useRef(null);
  const editModalRef = useRef(null);

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

  // QR modal close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setPreviewQR(null);
      }
    };
    if (previewQR) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [previewQR]);

  // Edit modal close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (editModalRef.current && !editModalRef.current.contains(e.target)) {
        setEditingAsset(null);
      }
    };
    if (editingAsset)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingAsset]);

  const handleEdit = (asset) => {
    setEditingAsset({ ...asset });
  };

  const updateAsset = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/asset/update/${editingAsset.serialNumber}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingAsset),
        },
      );
      const updated = await res.json();
      setAssets((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a)),
      );
      setEditingAsset(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/asset/delete/${assetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setAssets((prev) => prev.filter((a) => a._id !== assetId));
      // Adjust page if last item on current page was deleted
      const newTotal = assets.length - 1;
      const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages)
        setCurrentPage(Math.max(1, newTotalPages));
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(assets.length / ITEMS_PER_PAGE);
  const paginatedAssets = assets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getPageNumbers = () => {
    const pages = [];
    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading assets...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-6">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <nav className="mb-2">
            <ol className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              <li>Assets</li>
              <li className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
                <span className="text-blue-700 font-bold">
                  Inventory Details
                </span>
              </li>
            </ol>
          </nav>
          <h2 className="text-3xl font-bold text-slate-900">Asset Details</h2>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold flex items-center gap-2 hover:bg-white bg-white text-sm transition-all">
            <span className="material-symbols-outlined text-lg">
              filter_list
            </span>
            Filter Table
          </button>
          <button className="px-5 py-2 bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 text-sm hover:bg-blue-800 transition-all">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Data
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                {[
                  "Asset Name",
                  "Serial Number",
                  "Classification",
                  "Description",
                  "Category",

                  "Purchase Date",
                  "Issued Date",
                  "Issued To",
                  "Status",
                  "Life Span (Mos)",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase w-32 tracking-wider "
                  >
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                  Cost
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                  QR Code
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {paginatedAssets.map((asset, idx) => {
                const qrValue = JSON.stringify({
                  serialNumber: asset.serialNumber,
                  category: asset.category || "Uncategorized",
                });
                return (
                  <tr
                    key={asset._id}
                    className={`hover:bg-slate-50 transition-colors ${idx % 2 === 1 ? "bg-slate-50/40" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 min-w-[220px]">
                      {asset.assetName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {asset.serialNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {asset.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic">
                      {asset.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {asset.category || "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {asset.purchaseDate
                        ? new Date(asset.purchaseDate).toLocaleDateString(
                            "en-PH",
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {asset.issuedDate ? (
                        new Date(asset.issuedDate).toLocaleDateString("en-PH")
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {asset.issuedTo || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap  justify-center items-center px-4  py-1.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${statusStyles[asset.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {asset.status || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {asset.lifeSpan || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      ₱
                      {Number(asset.assetCost).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* QR Code */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        {asset.serialNumber ? (
                          <div
                            className="cursor-pointer border border-slate-200 rounded p-1 hover:border-blue-400 transition-colors"
                            onClick={() => setPreviewQR(qrValue)}
                          >
                            <QRCodeCanvas
                              value={qrValue}
                              size={36}
                              bgColor="white"
                              fgColor="#000000"
                              level="H"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No QR</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded"
                          title="Edit asset"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(asset._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded"
                          title="Delete asset"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {assets.length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-slate-400">
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Showing{" "}
            {assets.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, assets.length)} of{" "}
            {assets.length} entries
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-300 rounded text-xs bg-white text-slate-500 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 py-1 text-xs text-slate-400 flex items-end"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-xs border transition-colors ${
                    currentPage === page
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-slate-300 rounded text-xs bg-white text-slate-500 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* QR Preview Modal */}
      {previewQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={modalRef}
            className="relative bg-white p-8 rounded-xl flex flex-col items-center gap-4 shadow-xl"
          >
            <button
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-800 font-bold text-xl"
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
            <p className="text-sm text-slate-700 text-center">
              Serial Number:{" "}
              <span className="font-semibold text-slate-900">
                {JSON.parse(previewQR).serialNumber}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={editModalRef}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Asset</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the details for this asset
                </p>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Asset Name", key: "assetName" },
                { label: "Description", key: "description" },
                { label: "Issued To", key: "issuedTo" },
                { label: "Life Span (Yrs)", key: "lifeSpan", type: "number" },
                { label: "Asset Cost (₱)", key: "assetCost", type: "number" },
                { label: "Purchase Date", key: "purchaseDate", type: "date" },
                { label: "Issued Date", key: "issuedDate", type: "date" },
              ].map(({ label, key, type = "text" }) => (
                <div
                  key={key}
                  className={key === "description" ? "sm:col-span-2" : ""}
                >
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={
                      type === "date" && editingAsset[key]
                        ? new Date(editingAsset[key])
                            .toISOString()
                            .split("T")[0]
                        : editingAsset[key] || ""
                    }
                    onChange={(e) =>
                      setEditingAsset((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}

              {/* Status dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={editingAsset.status || ""}
                  onChange={(e) =>
                    setEditingAsset((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select status</option>
                  <option value="Good Condition">Good Condition</option>
                  <option value="For Maintenance">For Maintenance</option>
                  <option value="Condemned">Condemned</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setEditingAsset(null)}
                className="px-5 py-2 border border-slate-300 rounded-lg text-slate-600 text-sm font-semibold hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={updateAsset}
                className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">
                  save
                </span>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetailsTable;
