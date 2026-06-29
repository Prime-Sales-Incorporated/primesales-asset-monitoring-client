import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import API_BASE_URL from "../../API";
import db from "../../offline/db";

export default function RentalsDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const location = useLocation();

  const fetchUnits = useCallback(async () => {
    setLoading(true);

    try {
      let data = [];

      if (navigator.onLine) {
        // 🟢 ONLINE → fetch from server
        const res = await fetch(`${API_BASE_URL}/api/asset/get/all`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();

        // ✅ Normalize response — handles array, { assets: [] }, { data: [] }, etc.
        if (Array.isArray(json)) {
          data = json;
        } else if (Array.isArray(json?.assets)) {
          data = json.assets;
        } else if (Array.isArray(json?.data)) {
          data = json.data;
        } else if (Array.isArray(json?.units)) {
          data = json.units;
        } else {
          console.warn("Unexpected API response shape:", json);
          data = [];
        }

        // ✅ Set units immediately — don't let IndexedDB block rendering
        const forkliftsOnly = data.filter(
          (asset) => asset?.category === "Rental Eqpt",
        );
        setUnits(forkliftsOnly);

        // ✅ Cache to IndexedDB separately — non-critical, won't crash the page
        try {
          const validData = data.filter((item) => item && item._id);
          if (validData.length > 0) {
            await db.assets.bulkPut(validData);
          }
        } catch (dbErr) {
          console.warn("IndexedDB cache failed (non-critical):", dbErr);
        }
      } else {
        // 🔴 OFFLINE → load from IndexedDB
        try {
          data = await db.assets.toArray();
          console.log("Loaded from IndexedDB (offline):", data.length);
        } catch (dbErr) {
          console.warn("IndexedDB read failed:", dbErr);
          data = [];
        }

        const forkliftsOnly = data.filter(
          (asset) => asset?.category === "Rental Eqpt",
        );
        setUnits(forkliftsOnly);
      }
    } catch (error) {
      console.error("Error loading units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Re-fetch every time user navigates to this page
  useEffect(() => {
    fetchUnits();
  }, [location, fetchUnits]);

  // Get unique locations dynamically
  const locations = [
    "All",
    ...new Set(units.map((unit) => unit.unitLocation || "Unassigned")),
  ];

  // Apply filters
  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.serialNumber
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === "All" ||
      (unit.unitLocation || "Unassigned") === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading units...
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        <main className="w-full p-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">Forklift Inventory & Audit</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                On-site asset management and machinery verification.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <input
                placeholder="Search by serial number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 w-54 dark:border-slate-700"
              />

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 w-28 dark:border-slate-700"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchUnits}
                className="p-2 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="Refresh"
              >
                🔄
              </button>
            </div>
          </header>

          {/* Forklift Cards */}
          <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <span className="material-icons-round text-5xl mb-3">
                  inventory_2
                </span>
                <p className="font-semibold text-lg">No rental units found</p>
                <p className="text-sm mt-1">
                  Try adjusting your filters or register a new unit.
                </p>
              </div>
            ) : (
              filteredUnits.map((unit) => (
                <div
                  key={unit._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 flex flex-col hover:border-amber-400 transition"
                >
                  {/* Top */}
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
                        unit.status === "Good Condition"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : unit.status === "For Maintenance"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {unit.status || "Unknown"}
                    </span>
                  </div>

                  {/* Info */}
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
                      <p>{unit.rentPeriod ? unit.rentPeriod : "Unassigned"}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-auto flex justify-between border-t pt-4">
                    <button className="px-3 py-2 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 rounded uppercase">
                      Details
                    </button>

                    <Link to={`/assets/rentals/details/${unit.serialNumber}`}>
                      <button className="px-3 py-2 text-[11px] font-bold bg-green-500 text-white rounded uppercase hover:bg-green-600">
                        Audit Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            )}

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
          </div>
        </main>
      </div>
    </div>
  );
}
