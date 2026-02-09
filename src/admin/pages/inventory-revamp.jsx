import React, { useEffect, useState, useRef } from "react";
import API_BASE_URL from "../../API"; // Adjust path if needed
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";

const categoryIcons = {
  Electronics: "💻",
  "IT Equipment": "🖥️",
  Vehicles: "🚗",
  Logistics: "🚜",
  Furniture: "🪑",
  "Office Supplies": "📁",
  Tools: "🔧",
  Misc: "📦",
  Uncategorized: "❓",
  Building: "🏢",
};

const statusColors = {
  "Good Condition":
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  "For Maintenance":
    "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  Retired: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  Unknown: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
  Pending:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
};

const AssetInventory = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewQR, setPreviewQR] = useState(null);
  const modalRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

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

  // Close modal if clicked outside
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
      <div className="flex items-center justify-center h-screen text-lg">
        Loading assets...
      </div>
    );
  }
  const filteredAssets = assets.filter((asset) => {
    const matchesSerial = asset.serialNumber
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      (asset.category || "Uncategorized") === selectedCategory;

    return matchesSerial && matchesCategory;
  });

  const categories = [
    "All",
    ...new Set(assets.map((asset) => asset.category || "Uncategorized")),
  ];

  return (
    <main className="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">
            Asset Inventory
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Manage and track your organization's physical assets.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="relative">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 w-64 text-sm"
            />
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-500 dark:text-slate-400"
          >
            <span className="material-icons-round dark:hidden">dark_mode</span>
            <span className="material-icons-round hidden dark:block">
              light_mode
            </span>
          </button>
        </div>
      </header>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset._id}
            icon={
              categoryIcons[asset.category] || categoryIcons["Uncategorized"]
            }
            title={asset.assetName}
            category={asset.category || "Uncategorized"}
            purchaseDate={asset.purchaseDate}
            issueDate={asset.issuedDate}
            status={asset.status || "Unknown"}
            statusColor={statusColors[asset.status] || "gray"}
            description={asset.description || "No description available."}
            serial={asset.serialNumber || "-"}
            issued={asset.issuedTo || "-"}
            cost={
              asset.assetCost
                ? `₱${Number(asset.assetCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                : "-"
            }
            life={asset.lifeSpan || "-"}
            qrValue={JSON.stringify({
              serialNumber: asset.serialNumber,
              category: asset.category || "Uncategorized",
            })}
            onEdit={() => handleEdit(asset._id)}
            onDelete={() => handleDelete(asset._id)}
            onQrClick={() =>
              setPreviewQR(
                JSON.stringify({
                  serialNumber: asset.serialNumber,
                  category: asset.category || "Uncategorized",
                }),
              )
            }
          />
        ))}

        {/* Register New Asset */}

        <Link
          to="/assets/add"
          className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all flex flex-col items-center justify-center p-8 gap-4 min-h-[280px]"
        >
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm border flex items-center justify-center text-slate-400">
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
      </div>

      {/* QR Preview Modal */}
      {previewQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={modalRef}
            className="relative bg-white p-6 rounded-lg flex flex-col items-center gap-4"
          >
            <button
              className="absolute top-0 right-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-2xl"
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

            <p className="mt-2 text-center text-black text-sm font-medium">
              {previewQR}
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

const AssetCard = ({
  icon,
  title,
  category,
  status,
  statusColor,
  description,
  serial,
  issued,
  issueDate,
  purchaseDate,
  cost,
  life,
  qrValue,
  onEdit,
  onDelete,
  onQrClick,
}) => {
  const color = statusColors[status] || "gray"; // ✅ move it here
  return (
    <div className="bg-white overflow-auto dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-3xl">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg dark:text-white">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {category}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[status] || statusColors.Unknown}`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Serial Number
            </p>
            <p>{serial}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Issued To
            </p>
            <p>{issued}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Purchased Date
            </p>
            <p>
              {purchaseDate ? new Date(purchaseDate).toLocaleDateString() : "-"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Issue Date
            </p>
            <p>{issueDate ? new Date(issueDate).toLocaleDateString() : "-"}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Cost
            </p>
            <p className="font-bold text-green-500">{cost}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Life Span
            </p>
            <p>{life} month(s)</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-between border-t mt-4 items-center">
          <div
            className="flex justify-center mt-2 cursor-pointer"
            onClick={onQrClick}
          >
            <QRCodeCanvas
              value={qrValue}
              size={40}
              bgColor="white"
              fgColor="#000"
              level="H"
            />
          </div>

          <div className="flex  gap-2 mt-2 pt-0">
            <button
              className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              onClick={onEdit}
            >
              Edit
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-600 transition"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetInventory;
