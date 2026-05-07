import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../API";

const AssetScanner = () => {
  const navigate = useNavigate();

  const [rawScan, setRawScan] = useState("");
  const [manualId, setManualId] = useState("");
  const [parsedResult, setParsedResult] = useState(null);
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Parse the raw scanned string into { serialNumber, category }
  const parseQR = (raw) => {
    if (!raw) return null;

    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw.replace(/\+/g, " "));
    } catch {
      decoded = raw;
    }

    // Try JSON parse first (QR format from AssetInventory)
    try {
      const obj = JSON.parse(decoded);
      if (obj.serialNumber) {
        return {
          serialNumber: obj.serialNumber.trim(),
          // category present → regular asset modal
          // category absent  → treat as rental/unit → redirect
          category: obj.category ? obj.category.trim() : null, // trim removes trailing spaces that break URLs
        };
      }
    } catch {
      // Not JSON — plain serial number, no category → rental
    }

    return {
      serialNumber: decoded.trim(),
      category: null, // no category = rental
    };
  };

  // Fetch asset details (only called for non-rental assets that have a category)
  const fetchAsset = async (serialNumber, category) => {
    setLoading(true);
    setError("");
    setAsset(null);
    try {
      const params = `?category=${encodeURIComponent(category.trim())}`;
      const res = await fetch(
        `${API_BASE_URL}/api/asset/get/${encodeURIComponent(serialNumber)}${params}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        },
      );
      if (!res.ok) throw new Error("Asset not found");
      const data = await res.json();
      setAsset(data);
      setShowModal(true);
    } catch (err) {
      setError("Asset not found. Please check the serial number.");
    } finally {
      setLoading(false);
    }
  };

  // Main handler — decides: redirect (rental) or fetch+modal (asset)
  const handleResult = (raw) => {
    const parsed = parseQR(raw);
    setParsedResult(parsed);

    if (!parsed?.serialNumber) return;

    if (!parsed.category) {
      // ── RENTAL / UNIT ── no category in QR → redirect to audit page
      navigate(`/audit/${encodeURIComponent(parsed.serialNumber)}`);
    } else {
      // ── REGULAR ASSET ── has category → fetch and show modal
      fetchAsset(parsed.serialNumber, parsed.category);
    }
  };

  const handleScanChange = (e) => setRawScan(e.target.value);

  const handleScanKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleResult(rawScan);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    setRawScan(manualId.trim());
    handleResult(manualId.trim());
    setManualId("");
  };

  const handleClear = () => {
    setRawScan("");
    setParsedResult(null);
    setAsset(null);
    setError("");
    setShowModal(false);
    inputRef.current?.focus();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAsset(null);
    handleClear();
  };

  const statusColors = {
    "Good Condition": "bg-emerald-100 text-emerald-700",
    "For Maintenance": "bg-orange-100 text-orange-700",
    Retired: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Unknown: "bg-gray-100 text-gray-500",
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans">
        <div className="max-w-xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Asset Scanner
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Scan a QR code with a hardware scanner, or enter a serial number
              manually.
            </p>
            {/* Legend */}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                QR with category → Asset modal
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                Plain serial / no category → Rental audit
              </div>
            </div>
          </div>

          {/* Scanner input */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Scanner Input
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                qr_code_scanner
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Waiting for scan… (press Enter to confirm)"
                value={rawScan}
                onChange={handleScanChange}
                onKeyDown={handleScanKeyDown}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Click this field and scan — the scanner acts as a keyboard.
            </p>
          </div>

          {/* Inline error (only shows if not modal flow) */}
          {error && !showModal && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-4">
              <div className="flex items-start gap-3">
                <span className="material-icons-round text-red-500 mt-0.5">
                  error_outline
                </span>
                <div>
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                  {parsedResult && (
                    <p className="text-xs text-slate-400 mt-1">
                      Scanned:{" "}
                      <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">
                        {parsedResult.serialNumber}
                      </code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-4">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="material-icons-round animate-spin text-blue-500">
                  autorenew
                </span>
                <span className="text-sm">Looking up asset…</span>
              </div>
            </div>
          )}

          {/* Clear button */}
          {(parsedResult || error) && !showModal && (
            <button
              onClick={handleClear}
              className="w-full mb-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Clear &amp; Scan Again
            </button>
          )}

          {/* Manual input */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Manual Entry
            </p>
            <p className="text-xs text-slate-400 mb-3">
              Enter a serial number to look up an asset, or{" "}
              <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">
                {"{"}"serialNumber":"X","category":"Y"{"}"}
              </code>{" "}
              for an asset with category.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter serial number or JSON…"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit(e)}
                className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualSubmit}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition"
              >
                Look up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Asset Detail Modal (non-rental assets only) ── */}
      {showModal && asset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <span className="material-icons-round">close</span>
            </button>

            {/* Header */}
            <div className="flex justify-between items-start mb-5 pr-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {asset.assetName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {asset.category || "Uncategorized"}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 text-[10.5px] font-semibold rounded-full ${statusColors[asset.status] || statusColors.Unknown}`}
              >
                {asset.status || "Unknown"}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Serial #", asset.serialNumber],
                ["Issued To", asset.issuedTo || "-"],
                [
                  "Purchase Date",
                  asset.purchaseDate
                    ? new Date(asset.purchaseDate).toLocaleDateString("en-PH")
                    : "-",
                ],
                [
                  "Issue Date",
                  asset.issuedDate
                    ? new Date(asset.issuedDate).toLocaleDateString("en-PH")
                    : "-",
                ],
                [
                  "Cost",
                  asset.assetCost
                    ? `₱${Number(asset.assetCost).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                    : "-",
                ],
                ["Life Span", asset.lifeSpan ? `${asset.lifeSpan} mo.` : "-"],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                    {label}
                  </p>
                  <p className="text-slate-700 dark:text-slate-200 text-xs">
                    {val}
                  </p>
                </div>
              ))}
            </div>

            {asset.description && (
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
                {asset.description}
              </p>
            )}

            <button
              onClick={handleCloseModal}
              className="mt-5 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Close &amp; Scan Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AssetScanner;
