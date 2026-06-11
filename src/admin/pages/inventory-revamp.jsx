import React, { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../API";
import { fetchAssetsService } from "../../../src/services/assetService";

const categoryIcons = {
  "Office Eqpt & Furniture": "💻",
  Laptop: "💻",
  "IT Equipment": "🖥️",
  Vehicles: "🚗",
  Logistics: "🚜",
  Furniture: "🪑",
  "Office Supplies": "📁",
  Tools: "🔧",
  Misc: "📦",
  Uncategorized: "❓",
  "Building Imp": "🏢",
  Unit: "/forklift1.png",
};

const statusColors = {
  "Good Condition":
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  "For Maintenance":
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  Retired: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  Unknown: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  Pending:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  "For Disposal":
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const ITEMS_PER_PAGE = 10;

const KNOWN_CATEGORIES = [
  "Office Eqpt & Furniture",
  "Land Property",
  "IT Equipment",
  "Vehicles",
  "Logistics",
  "Furniture",
  "Office Supplies",
  "Tools",
  "Misc",
  "Building Imp",
  "Units",
];

const AssetInventory = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState("card");
  const [showAll, setShowAll] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewQR, setPreviewQR] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);

  // Computed stats from the current asset list
  const stats = {
    good: assets.filter((a) => a.status === "Good Condition").length,
    maintenance: assets.filter((a) => a.status === "For Maintenance").length,
    disposal: assets.filter((a) => a.status === "For Disposal").length,
    totalCost: assets.reduce((sum, a) => sum + (Number(a.assetCost) || 0), 0),
  };

  const modalRef = useRef(null);
  const editModalRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Debounce search ──
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── Reset page on filter change ──
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus, showAll]);

  // ── Fetch assets ──
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchAssetsService({
          page: showAll ? 1 : currentPage,
          limit: showAll ? 10000 : ITEMS_PER_PAGE,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          status: selectedStatus !== "All" ? selectedStatus : undefined,
          search: searchTerm || undefined,
        });

        if (cancelled) return;

        const list = Array.isArray(data) ? data : (data.assets ?? []);
        setAssets(list);
        setTotal(data.total ?? list.length);
        setTotalPages(showAll ? 1 : (data.totalPages ?? 1));
      } catch (err) {
        if (cancelled) return;
        console.error("Load failed:", err);
        setAssets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentPage, selectedCategory, selectedStatus, searchTerm, showAll]);

  // ── Reload on reconnect ──
  useEffect(() => {
    const handleOnline = () => setCurrentPage((p) => p);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // ── Modal close on outside click ──
  useEffect(() => {
    const handle = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target))
        setPreviewQR(null);
    };
    if (previewQR) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [previewQR]);

  useEffect(() => {
    const handle = (e) => {
      if (editModalRef.current && !editModalRef.current.contains(e.target))
        setEditingAsset(null);
    };
    if (editingAsset) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [editingAsset]);

  // ── Pagination helpers ──
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      )
        pages.push(i);
      else if (pages[pages.length - 1] !== "...") pages.push("...");
    }
    return pages;
  };

  const startEntry = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endEntry = showAll
    ? total
    : Math.min(currentPage * ITEMS_PER_PAGE, total);

  // ── CRUD ──
  const handleEdit = (asset) => setEditingAsset({ ...asset });

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

  const handleDelete = async (serialNumber) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/asset/delete/${serialNumber}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setAssets((prev) => prev.filter((a) => a.serialNumber !== serialNumber));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  const qrValue = (asset) =>
    asset.category === "Rental Eqpt"
      ? asset.serialNumber
      : JSON.stringify({
          serialNumber: asset.serialNumber,
          category: asset.category || "Uncategorized",
        });

  // ── Pagination Bar ──
  const PaginationBar = () => (
    <div className="flex items-center justify-between py-2 px-1">
      <p className="text-xs text-slate-500">
        {total === 0
          ? "No entries"
          : showAll
            ? `Showing all ${total} entries`
            : `Showing ${startEntry}–${endEntry} of ${total} entries`}
      </p>
      {!showAll && (
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 h-7 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            Previous
          </button>
          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span
                key={`e-${i}`}
                className="px-2 flex items-center text-xs text-slate-400"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 h-7 text-xs border rounded transition ${
                  currentPage === page
                    ? "bg-blue-700 text-white border-blue-700"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ),
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 h-7 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );

  if (loading && assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading assets...
      </div>
    );
  }

  return (
    <main className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">
            Asset Inventory
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and track your organization's physical assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Name or serial…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-3 h-9 rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 w-44 text-sm outline-none"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm"
          >
            <option value="All">All Categories</option>
            {KNOWN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm"
          >
            {[
              "All",
              "Good Condition",
              "For Maintenance",
              "For Disposal",
              "Pending",
              "Retired",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Show All toggle */}
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className={`h-9 px-3 rounded-lg text-sm font-semibold border transition flex items-center gap-1.5 ${
              showAll
                ? "bg-blue-700 text-white border-blue-700 hover:bg-blue-800"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            title={
              showAll ? "Switch to paginated view" : "Show all assets at once"
            }
          >
            <span className="material-icons-round text-[16px]">
              {showAll ? "filter_list_off" : "select_all"}
            </span>
            {showAll ? "Paginate" : "Show All"}
          </button>

          {/* View toggle */}
          <div className="flex  rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden ml-auto">
            <button
              onClick={() => setView("card")}
              className={`flex items-center gap-1.5 px-3 h-9 text-sm transition ${
                view === "card"
                  ? "bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-500"
              }`}
            >
              <span className="material-icons-round text-[16px]">
                grid_view
              </span>
              Cards
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 px-3 h-9 text-sm transition ${
                view === "table"
                  ? "bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-500"
              }`}
            >
              <span className="material-icons-round text-[16px]">
                table_rows
              </span>
              Table
            </button>
          </div>
        </div>
      </header>

      {/* ── Stats row ── */}
      {/* NOTE: When showAll is active, stats reflect ALL matching assets.
               When paginated, stats only reflect the current page. */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          {
            label: showAll ? "Total Assets" : "Total Assets",
            value: total,
            color: "",
          },
          {
            label: "Good Condition",
            value: stats.good,
            color: "text-emerald-600",
          },
          {
            label: "For Maintenance",
            value: stats.maintenance,
            color: "text-orange-500",
          },
          {
            label: "For Disposal",
            value: stats.disposal,
            color: "text-red-500",
          },
          {
            label: showAll ? "Total Value (all)" : "Total Value (page)",
            value: `${stats.totalCost.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}`,
            color: "text-blue-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
              {s.label}
            </p>
            <p className={`text-2xl font-bold ${s.color || "dark:text-white"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Show All banner */}
      {showAll && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <span className="material-icons-round text-[16px]">info</span>
          <span>
            Showing all <strong>{total}</strong> assets — pagination is
            disabled. Stats above reflect the full dataset.
          </span>
          <button
            onClick={() => setShowAll(false)}
            className="ml-auto text-xs underline hover:no-underline"
          >
            Switch back to paginated
          </button>
        </div>
      )}

      {/* Refreshing indicator */}
      {loading && (
        <div className="text-center py-3 text-sm text-slate-400 animate-pulse">
          Refreshing...
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {view === "card" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {assets.map((asset) => {
              const icon =
                categoryIcons[asset.category] || categoryIcons["Uncategorized"];
              return (
                <div
                  key={asset._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                          {icon.startsWith("/") || icon.startsWith("http") ? (
                            <img
                              src={icon}
                              alt={asset.category}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            icon
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm dark:text-white leading-tight">
                            {asset.assetName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {asset.category || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          statusColors[asset.status] || statusColors.Unknown
                        }`}
                      >
                        {asset.status || "Unknown"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 text-sm mb-4">
                      {[
                        ["Serial #", asset.serialNumber || "-"],
                        ["Issued To", asset.issuedTo || "-"],
                        [
                          "Purchase Date",
                          asset.purchaseDate
                            ? new Date(asset.purchaseDate).toLocaleDateString()
                            : "-",
                        ],
                        [
                          "Issue Date",
                          asset.issuedDate
                            ? new Date(asset.issuedDate).toLocaleDateString()
                            : "-",
                        ],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] uppercase font-bold text-slate-400">
                            {label}
                          </p>
                          <p className="text-slate-700 dark:text-slate-200 text-xs">
                            {val}
                          </p>
                        </div>
                      ))}
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Cost
                        </p>
                        <p className="text-emerald-600 font-bold text-xs">
                          {asset.assetCost
                            ? `₱${Number(asset.assetCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Life Span
                        </p>
                        <p className="text-xs">
                          {asset.lifeSpan ? `${asset.lifeSpan} mo.` : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
                      <div
                        className="cursor-pointer hover:opacity-75 transition"
                        onClick={() => setPreviewQR(qrValue(asset))}
                      >
                        <QRCodeCanvas
                          value={qrValue(asset)}
                          size={36}
                          bgColor="white"
                          fgColor="#000"
                          level="H"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(asset.serialNumber)}
                          className="px-3 py-1.5 text-xs bg-red1 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add card */}
            <Link
              to="/assets/add"
              className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all flex flex-col items-center justify-center p-8 gap-4 min-h-[260px]"
            >
              <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-sm border flex items-center justify-center text-slate-400">
                <span className="material-icons-round text-3xl">add</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600 dark:text-slate-300">
                  Register New Asset
                </p>
                <p className="text-sm text-slate-400">
                  Click here to add to inventory
                </p>
              </div>
            </Link>

            {assets.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 text-slate-400">
                No assets match your filters.
              </div>
            )}
          </div>

          {/* Only show pagination bar when not in showAll mode */}
          {!showAll && totalPages > 1 && (
            <div className="mt-6">
              <PaginationBar />
            </div>
          )}

          {/* Show All mode footer count */}
          {showAll && assets.length > 0 && (
            <div className="mt-6">
              <PaginationBar />
            </div>
          )}
        </>
      )}

      {/* ── TABLE VIEW ── */}
      {view === "table" && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px] border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  {[
                    "Asset Name",
                    "Serial #",
                    "Category",
                    "Status",
                    "Issued To",
                    "Purchase Date",
                    "Cost",
                    "Life Span",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {assets.map((asset, idx) => (
                  <tr
                    key={asset._id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                      idx % 2 === 1 ? "bg-slate-50/50 dark:bg-slate-800/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white min-w-[180px]">
                      {asset.assetName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {asset.serialNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {asset.category || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex whitespace-nowrap px-2.5 py-1 text-[10.5px] font-semibold rounded-full ${
                          statusColors[asset.status] || statusColors.Unknown
                        }`}
                      >
                        {asset.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {asset.issuedTo || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {asset.purchaseDate
                        ? new Date(asset.purchaseDate).toLocaleDateString(
                            "en-PH",
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">
                      {asset.assetCost
                        ? `₱${Number(asset.assetCost).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {asset.lifeSpan ? `${asset.lifeSpan} mo.` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewQR(qrValue(asset))}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded"
                          title="View QR"
                        >
                          <span className="material-icons-round text-[16px]">
                            qr_code
                          </span>
                        </button>
                        <button
                          onClick={() => handleEdit(asset)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded"
                          title="Edit"
                        >
                          <span className="material-icons-round text-[16px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(asset.serialNumber)}
                          className="p-1.5 text-slate-400 hover:text-red-600 bg-red1 transition rounded"
                          title="Delete"
                        >
                          <span className="material-icons-round bg-red1 text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-slate-400"
                    >
                      No assets match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
            <PaginationBar />
          </div>
        </div>
      )}

      {/* ── QR Preview Modal ── */}
      {previewQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={modalRef}
            className="relative bg-white dark:bg-slate-800 p-8 rounded-xl flex flex-col items-center gap-4 shadow-xl"
          >
            <button
              className="absolute top-3 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold text-2xl"
              onClick={() => setPreviewQR(null)}
            >
              ×
            </button>
            <QRCodeCanvas
              value={previewQR}
              size={200}
              bgColor="white"
              fgColor="#000"
              level="H"
            />
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
              {(() => {
                try {
                  const p = JSON.parse(previewQR);
                  return `${p.serialNumber} · ${p.category}`;
                } catch {
                  return previewQR;
                }
              })()}
            </p>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={editModalRef}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold dark:text-white">
                  Edit Asset
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the details for this asset
                </p>
              </div>
              <button
                onClick={() => setEditingAsset(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <span className="material-icons-round text-[20px]">close</span>
              </button>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Asset Name", key: "assetName" },
                { label: "Description", key: "description", full: true },
                { label: "Issued To", key: "issuedTo" },
                {
                  label: "Life Span (months)",
                  key: "lifeSpan",
                  type: "number",
                },
                { label: "Asset Cost (₱)", key: "assetCost", type: "text" },
                { label: "Purchase Date", key: "purchaseDate", type: "date" },
                { label: "Issued Date", key: "issuedDate", type: "date" },
              ].map(({ label, key, type = "text", full }) => (
                <div key={key} className={full ? "sm:col-span-2" : ""}>
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
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

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
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status</option>
                  <option>Good Condition</option>
                  <option>For Maintenance</option>
                  <option>For Disposal</option>
                  <option>Pending</option>
                  <option>Retired</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-xl">
              <button
                onClick={() => setEditingAsset(null)}
                className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-white dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateAsset}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5"
              >
                <span className="material-icons-round text-[16px]">save</span>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AssetInventory;
