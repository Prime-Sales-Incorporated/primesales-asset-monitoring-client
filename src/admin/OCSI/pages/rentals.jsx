import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../../API";
import db from "../../../offline/db";
import { OCSIfetchAssetsService } from "../../../services/OCSIassetService";

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
const RENTAL_CATEGORY = "Rental Eqpt";

export default function RentalsDashboard() {
  const [darkMode] = useState(false);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState("card");
  const [showAll, setShowAll] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedLocation, setSelectedLocation] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Locations are derived from whatever's currently loaded on screen.
  // Note: in paginated mode this only reflects the current page's units;
  // switch to "Show All" to see the full set of site locations.
  const [locationOptions, setLocationOptions] = useState(["All"]);

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
  }, [selectedLocation, showAll]);

  // ── Track online/offline ──
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // ── Fetch units (server-paginated when online, client-paginated from cache when offline) ──
  const fetchUnits = useCallback(
    async (cancelledRef) => {
      setLoading(true);
      try {
        if (navigator.onLine) {
          const data = await OCSIfetchAssetsService({
            page: showAll ? 1 : currentPage,
            limit: showAll ? 10000 : ITEMS_PER_PAGE,
            category: RENTAL_CATEGORY,
            location: selectedLocation !== "All" ? selectedLocation : undefined,
            search: searchTerm || undefined,
          });

          if (cancelledRef?.current) return;

          const list = Array.isArray(data) ? data : (data.assets ?? []);
          setUnits(list);
          setTotal(data.total ?? list.length);
          setTotalPages(showAll ? 1 : (data.totalPages ?? 1));

          // Cache full page(s) we've seen — non-critical, best-effort
          try {
            const validData = list.filter((item) => item && item._id);
            if (validData.length > 0) await db.assets.bulkPut(validData);
          } catch (dbErr) {
            console.warn("IndexedDB cache failed (non-critical):", dbErr);
          }

          // Build location filter options from this response when we have
          // the fuller picture (Show All) — otherwise leave prior options.
          if (showAll) {
            const locs = [
              "All",
              ...new Set(list.map((u) => u.unitLocation || "Unassigned")),
            ];
            setLocationOptions(locs);
          }
        } else {
          // 🔴 OFFLINE → load from IndexedDB and paginate client-side
          let cached = [];
          try {
            cached = await db.assets.toArray();
          } catch (dbErr) {
            console.warn("IndexedDB read failed:", dbErr);
            cached = [];
          }

          let forklifts = cached.filter((a) => a?.category === RENTAL_CATEGORY);

          if (searchTerm) {
            const q = searchTerm.toLowerCase();
            forklifts = forklifts.filter((u) =>
              u.serialNumber?.toLowerCase().includes(q),
            );
          }
          if (selectedLocation !== "All") {
            forklifts = forklifts.filter(
              (u) => (u.unitLocation || "Unassigned") === selectedLocation,
            );
          }

          const locs = [
            "All",
            ...new Set(
              cached
                .filter((a) => a?.category === RENTAL_CATEGORY)
                .map((u) => u.unitLocation || "Unassigned"),
            ),
          ];
          setLocationOptions(locs);

          const totalCount = forklifts.length;
          const pages = showAll
            ? 1
            : Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
          const pageSlice = showAll
            ? forklifts
            : forklifts.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE,
              );

          if (cancelledRef?.current) return;
          setUnits(pageSlice);
          setTotal(totalCount);
          setTotalPages(pages);
        }
      } catch (error) {
        console.error("Error loading units:", error);
        if (!cancelledRef?.current) {
          setUnits([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelledRef?.current) setLoading(false);
      }
    },
    [currentPage, selectedLocation, searchTerm, showAll],
  );

  useEffect(() => {
    const cancelledRef = { current: false };
    fetchUnits(cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchUnits]);

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

  if (loading && units.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-slate-500">
        Loading units...
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        <main className="w-full p-6">
          {/* ── Header ── */}
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Forklift Inventory &amp; Audit
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                On-site asset management and machinery verification.
                {isOffline && (
                  <span className="ml-2 text-amber-600 font-semibold">
                    (Offline — showing cached data)
                  </span>
                )}
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
                  placeholder="Search by serial number"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-3 h-9 rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 w-52 text-sm outline-none"
                />
              </div>

              {/* Location filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-9 px-3 rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 text-sm"
              >
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
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
                  showAll
                    ? "Switch to paginated view"
                    : "Show all rental units at once"
                }
              >
                <span className="material-icons-round text-[16px]">
                  {showAll ? "filter_list_off" : "select_all"}
                </span>
                {showAll ? "Paginate" : "Show All"}
              </button>

              {/* View toggle */}
              <div className="flex rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
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

              {/* Refresh */}
              <button
                onClick={() => fetchUnits({ current: false })}
                className="h-9 w-9 flex items-center justify-center rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="Refresh"
              >
                🔄
              </button>
            </div>
          </header>

          {/* Show All banner */}
          {showAll && (
            <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              <span className="material-icons-round text-[16px]">info</span>
              <span>
                Showing all <strong>{total}</strong> rental units — pagination
                is disabled.
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {units.map((unit) => (
                  <div
                    key={unit._id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 flex flex-col hover:border-amber-400 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg dark:text-white">
                          {unit.assetName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {unit.category}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          statusColors[unit.status] || statusColors.Unknown
                        }`}
                      >
                        {unit.status || "Unknown"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Serial Number
                        </p>
                        <p>{unit.serialNumber || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Purchase Date
                        </p>
                        <p>
                          {unit.purchaseDate
                            ? new Date(unit.purchaseDate).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Client Site Location
                        </p>
                        <p>{unit.unitLocation || "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Rent Period
                        </p>
                        <p>
                          {unit.rentPeriod ? unit.rentPeriod : "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between border-t pt-4">
                      <button className="px-3 py-2 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 rounded uppercase">
                        Details
                      </button>
                      <Link
                        to={`/ocsi/assets/rentals/details/${unit.serialNumber}`}
                      >
                        <button className="px-3 py-2 text-[11px] font-bold bg-green-500 text-white rounded uppercase hover:bg-green-600">
                          Audit Now
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Add New Unit */}
                <Link
                  to="/assets/add"
                  className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all flex flex-col items-center justify-center p-8 gap-4 min-h-[280px]"
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm border flex items-center justify-center text-slate-400">
                    <span className="material-icons-round text-3xl">add</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-600 dark:text-slate-300">
                      Register New Unit
                    </p>
                    <p className="text-sm text-slate-400">
                      Click here to add forklift
                    </p>
                  </div>
                </Link>

                {units.length === 0 && !loading && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                    <span className="material-icons-round text-5xl mb-3">
                      inventory_2
                    </span>
                    <p className="font-semibold text-lg">
                      No rental units found
                    </p>
                    <p className="text-sm mt-1">
                      Try adjusting your filters or register a new unit.
                    </p>
                  </div>
                )}
              </div>

              {!showAll && totalPages > 1 && (
                <div className="mt-6">
                  <PaginationBar />
                </div>
              )}
              {showAll && units.length > 0 && (
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
                        "Status",
                        "Client Site Location",
                        "Purchase Date",
                        "Rent Period",
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
                    {units.map((unit, idx) => (
                      <tr
                        key={unit._id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                          idx % 2 === 1
                            ? "bg-slate-50/50 dark:bg-slate-800/50"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white min-w-[180px]">
                          {unit.assetName}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {unit.serialNumber || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex whitespace-nowrap px-2.5 py-1 text-[10.5px] font-semibold rounded-full ${
                              statusColors[unit.status] || statusColors.Unknown
                            }`}
                          >
                            {unit.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {unit.unitLocation || "Unassigned"}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {unit.purchaseDate
                            ? new Date(unit.purchaseDate).toLocaleDateString(
                                "en-PH",
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {unit.rentPeriod || "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 rounded uppercase"
                              title="Details"
                            >
                              Details
                            </button>
                            <Link
                              to={`/ocsi/assets/rentals/details/${unit.serialNumber}`}
                            >
                              <button
                                className="px-2.5 py-1 text-[11px] font-bold bg-green-500 text-white rounded uppercase hover:bg-green-600"
                                title="Audit"
                              >
                                Audit
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {units.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-slate-400"
                        >
                          No rental units found.
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
        </main>
      </div>
    </div>
  );
}
