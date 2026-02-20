import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../API";

export default function RentalsDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/asset/get/all`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        // Filter only Units
        const forkliftsOnly = data.filter(
          (asset) => asset.category === "Units",
        );

        setUnits(forkliftsOnly);
      } catch (error) {
        console.error("Error fetching units:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  // Get unique locations dynamically
  const locations = [
    "All",
    ...new Set(units.map((unit) => unit.location || "Unassigned")),
  ];

  // Apply filters
  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.serialNumber
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedLocation === "All" ||
      (unit.location || "Unassigned") === selectedLocation;

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
                placeholder="Search serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700"
              />

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Dark Mode */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700"
              >
                🌙
              </button>
            </div>
          </header>

          {/* Forklift Cards */}
          <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => (
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
                  <div className="">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Client Site Location
                    </p>
                    <p>{unit.unitLocation || "Unassigned"}</p>
                  </div>
                  <div className="">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Date Acquired by Client
                    </p>
                    <p>
                      {unit.dateAcquiredByClient
                        ? new Date(
                            unit.dateAcquiredByClient,
                          ).toLocaleDateString("en-US")
                        : "Unassigned"}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-auto flex justify-between border-t pt-4">
                  <button className="px-3 py-2 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 rounded uppercase">
                    Details
                  </button>

                  <Link to={`/assets/rentals/details/${unit._id}`}>
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
          </div>
        </main>
      </div>
    </div>
  );
}
