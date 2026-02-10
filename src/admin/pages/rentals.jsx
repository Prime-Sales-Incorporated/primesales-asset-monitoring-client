import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function RentalsDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  const forklifts = [
    {
      name: "Toyota High-Capacity",
      type: "Internal Combustion",
      status: "Verified",
      serial: "THC-8829-XL",
      lastAudit: "Oct 24, 2023",
      location: "North Logistics Hub - Bay 4",
    },
    {
      name: "Crown Electric",
      type: "Reach Truck",
      status: "Audit Pending",
      serial: "CRW-3301-E",
      lastAudit: "Sep 12, 2023",
      location: "Port Terminal A - Warehouse 2",
    },
    {
      name: "Hyster S155FT",
      type: "IC Counterbalance",
      status: "Verified",
      serial: "HYS-FT-551",
      lastAudit: "Oct 15, 2023",
      location: "East Distribution - Cold Storage",
    },
    {
      name: "Raymond 7000",
      type: "Reach Truck",
      status: "Audit Pending",
      serial: "RAY-7K-009",
      lastAudit: "Aug 20, 2023",
      location: "Central Warehouse - Section C",
    },
    {
      name: "Mitsubishi FGC25N",
      type: "Cushion Tire",
      status: "Verified",
      serial: "MIT-FG-442",
      lastAudit: "Nov 02, 2023",
      location: "North Logistics Hub - Bay 12",
    },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
        {/* Sidebar */}

        {/* Main Content */}
        <main className="flex- w-full p-8">
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
              <input
                placeholder="Search serial or model..."
                className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700"
              />

              <select className="px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700">
                <option>All Client Sites</option>
                <option>North Logistics Hub</option>
                <option>Port Terminal A</option>
                <option>Central Warehouse</option>
              </select>

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
            {forklifts.map((unit, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-700 flex flex-col hover:border-amber-400 transition"
              >
                {/* Top */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">
                        {unit.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {unit.type}
                      </p>
                    </div>
                  </div>
                  <span
                    className={` px-2.5 py-1 text-xs font-semibold rounded-full  ${
                      unit.status === "Verified"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Serial Number
                    </p>
                    <p>{unit.serial}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Last Audit
                    </p>
                    <p>{unit.lastAudit}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Client Site Location
                    </p>
                    <p>{unit.location}</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-auto flex justify-between border-t pt-4">
                  <button className="px-3 py-2 text-[11px] font-bold bg-slate-200 dark:bg-slate-700 rounded uppercase">
                    Details
                  </button>
                  <Link to="/assets/rentals/details">
                    {" "}
                    <button className="px-3 py-2 text-[11px] font-bold bg-amber-500 text-black rounded uppercase hover:bg-amber-400">
                      Audit Now
                    </button>
                  </Link>
                </div>
              </div>
            ))}

            <Link
              to="/assets/add"
              className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all flex flex-col items-center justify-center p-8 gap-4 min-h-[2 80px]"
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
        </main>
      </div>
    </div>
  );
}
