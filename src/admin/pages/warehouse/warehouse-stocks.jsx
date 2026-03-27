import React from "react";

export default function WarehouseInventory() {
  return (
    <div className="text-on-surface">
      {/* Top Navbar */}

      {/* Main Content */}
      <main className=" p-8 min-h-screen bg-surface">
        {/* Hero Header */}
        <section className="mb-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="font-extrabold text-4xl tracking-tight">
                Forklift Parts
              </h1>

              <p className="text-gray-500 mt-1">
                Operational Audit: Zone A through F
              </p>
            </div>

            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-gray-100 rounded-xl font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  download
                </span>
                Export CSV
              </button>

              <button className="px-6 py-2.5 bg-blue-600 rounded-xl font-bold text-sm text-white shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  add_box
                </span>
                Register Stock
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-3xl">
                  inventory
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Total Active SKU
                </p>
                <p className="text-3xl font-black">2,842</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-3xl">
                  warning
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Out of Stocks
                </p>
                <p className="text-3xl font-black text-red-600">48</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined text-3xl">
                  payments
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Total Valuation
                </p>
                <p className="text-3xl font-black">$1.42M</p>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Table */}
        <section className="bg-white rounded-3xl shadow-sm overflow-hidden border">
          <div className="p-8 flex items-center justify-between">
            <h2 className="font-extrabold text-xl">Asset Inventory</h2>

            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  search
                </span>

                <input
                  className="bg-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm w-64"
                  placeholder="Search by Part ID or Bin..."
                />
              </div>

              <button className="p-2 bg-gray-100 rounded-xl">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr class="bg-surface-container-low/50">
                  <th class="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    QR Code
                  </th>
                  <th class="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Part &amp; Description
                  </th>
                  <th class="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Location/Bin
                  </th>
                  <th class="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th class="px-4 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Reorder Point
                  </th>
                  <th class="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/10">
                <tr class="hover:bg-surface-container-low/40 transition-colors group">
                  <td class="px-8 py-5">
                    <div class="h-12 w-12 rounded-lg bg-surface-container-highest flex items-center justify-center p-1 border border-outline-variant/20 shadow-inner overflow-hidden">
                      <img
                        alt="QR Code"
                        class="w-full h-full object-cover mix-blend-multiply"
                        data-alt="Macro photo of a sharp black and white QR code printed on a textured industrial label with slight gloss finish"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiqLzoDG4W-g2EP7TKWQfnUnpwCyAQzxV6lPTYec-FOL_4kYFKhSPCLZ5J76KZouMsXa9DBTJ456B-SY3H8o7no38m24zlZC3hFeJngsi2Vcjxvw-ESukbQ5HANsjjJgb1jj4RfZU9ONYsCNaIKQL4qEK9FmxYL0tTEnucu4Hir8mJvAuh_16K5vh-d1dmB0m2-Gasl3RNmDUCA19yeRphO0t9JwR-1j37BaVbwdx2wAOtco7SNEWA_UI2gQI79LeWRBm_CVWnctXo"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <div>
                      <p class="font-bold text-on-surface">
                        Hydraulic Seal Kit
                      </p>
                      <p class="text-xs text-on-surface-variant font-medium">
                        LHC-001 • OEM Series-X
                      </p>
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold">
                      HYDRAULICS
                    </span>
                  </td>
                  <td class="px-4 py-5 font-mono text-sm text-primary font-bold">
                    A-12-04
                  </td>
                  <td class="px-4 py-5">
                    <div class="flex flex-col gap-1.5 w-32">
                      <div class="flex justify-between text-[10px] font-bold">
                        <span>124 Units</span>
                        <span class="text-on-secondary-container">
                          IN STOCK
                        </span>
                      </div>
                      <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div class="h-full bg-primary rounded-full w-[82%]"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-5 font-headline font-bold text-on-surface-variant">
                    25
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button class="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          visibility
                        </span>
                      </button>
                      <button class="p-2 hover:bg-secondary-container/50 text-secondary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="hover:bg-surface-container-low/40 transition-colors group">
                  <td class="px-8 py-5">
                    <div class="h-12 w-12 rounded-lg bg-surface-container-highest flex items-center justify-center p-1 border border-outline-variant/20 shadow-inner overflow-hidden">
                      <img
                        alt="QR Code"
                        class="w-full h-full object-cover mix-blend-multiply"
                        data-alt="Digital scan of an asset identification barcode and QR code combination on a durable plastic tag"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCbss4W6cH8dOBsNDuE0bufkjW8bf8fOiQyMAjkhbQk1HaA13efQaYEST468t3mM3exEnFMRmCDIzhFD1k5DqVuY_A725abelaSRUH08k_mCWO3_p8NDKGC-yoJ9wFwEe_XOlEEzz3Bf7lXb2zXJAYNXn0YgmyIdrvoKysXYdfUMOMH56hOWJzCJUUOrwdKaptDMNkiQhHKbH4c6om2dqil4WPsR3mdmx0bZ8-L7yMokOaHmL1BQbaA0oIMWT2H8M-O4LsPBYvEpyt"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <div>
                      <p class="font-bold text-on-surface">
                        Transmission Drive Belt
                      </p>
                      <p class="text-xs text-on-surface-variant font-medium">
                        DB-992-K • Heavy Duty
                      </p>
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold">
                      POWERTRAIN
                    </span>
                  </td>
                  <td class="px-4 py-5 font-mono text-sm text-primary font-bold">
                    B-04-12
                  </td>
                  <td class="px-4 py-5">
                    <div class="flex flex-col gap-1.5 w-32">
                      <div class="flex justify-between text-[10px] font-bold">
                        <span>8 Units</span>
                        <span class="text-error">LOW STOCK</span>
                      </div>
                      <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div class="h-full bg-error rounded-full w-[15%]"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-5 font-headline font-bold text-on-surface-variant">
                    15
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button class="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          visibility
                        </span>
                      </button>
                      <button class="p-2 hover:bg-secondary-container/50 text-secondary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="hover:bg-surface-container-low/40 transition-colors group">
                  <td class="px-8 py-5">
                    <div class="h-12 w-12 rounded-lg bg-surface-container-highest flex items-center justify-center p-1 border border-outline-variant/20 shadow-inner overflow-hidden">
                      <img
                        alt="QR Code"
                        class="w-full h-full object-cover mix-blend-multiply"
                        data-alt="Industrial equipment serial number tag with embedded QR code for inventory tracking"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMJVdp6Vo9f8sD1k6ma_wAyH2mLVlq3Acqgt_KzANIFxcMxgGy1Ee1mtwMLmtVMIEj0fAXGOebDZr9vuYCkUuSIdw83clTdmu-wloDp4f7GqTHSWAJYcMvOwnRfwmCFig-RQfpzaiGoneez3YbOpK5Q5tHGItKk4Z4lFi4dUjWTyMZTNghpTvlFuGacZYbMli6KgdQDCwtWPhg-sKghKWlN8hujfWGzoj6VrhYscbBeTpvP3g3QdYjbWYZ93E3XZ6OeM3CIjDHHekv"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <div>
                      <p class="font-bold text-on-surface">
                        LED Headlight Assembly
                      </p>
                      <p class="text-xs text-on-surface-variant font-medium">
                        E-LIT-50 • IP67 Rated
                      </p>
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold">
                      ELECTRICAL
                    </span>
                  </td>
                  <td class="px-4 py-5 font-mono text-sm text-primary font-bold">
                    D-01-01
                  </td>
                  <td class="px-4 py-5">
                    <div class="flex flex-col gap-1.5 w-32">
                      <div class="flex justify-between text-[10px] font-bold">
                        <span>0 Units</span>
                        <span class="text-error font-black">OUT OF STOCK</span>
                      </div>
                      <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div class="h-full bg-error/20 rounded-full w-0"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-5 font-headline font-bold text-on-surface-variant">
                    10
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button class="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          visibility
                        </span>
                      </button>
                      <button class="p-2 hover:bg-secondary-container/50 text-secondary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="hover:bg-surface-container-low/40 transition-colors group">
                  <td class="px-8 py-5">
                    <div class="h-12 w-12 rounded-lg bg-surface-container-highest flex items-center justify-center p-1 border border-outline-variant/20 shadow-inner overflow-hidden">
                      <img
                        alt="QR Code"
                        class="w-full h-full object-cover mix-blend-multiply"
                        data-alt="Modern inventory control label featuring a high-density QR code for rapid laser scanning"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkeoJ0rqhEDFmfHR9aQDM4BCxwgtTmVFjhMxB6sUmkrTOeZCjkDEttunwOBCYnvMSus65CX5dnsYfIZwXdVf253cMETb2AFUfYTjqaxsyMfWUHwgr2y4HkLXd1jBwedKY5rzXBbvM62Ot3dcXs2Hz1N2rVswveRduA85uCsfJfHF3NtqxrtzqXJpPy3v5SFA_VzWnNsNIuHqzPRkHuk7RXfwyv0AcgrBRen1dQu7L6EqKqaJZiAQVI9P-JyYpEqGD6DrpoExF2HVCT"
                      />
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <div>
                      <p class="font-bold text-on-surface">
                        Carburetor Rebuild Kit
                      </p>
                      <p class="text-xs text-on-surface-variant font-medium">
                        FUEL-90 • Gasket Inc.
                      </p>
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold">
                      FUEL SYSTEM
                    </span>
                  </td>
                  <td class="px-4 py-5 font-mono text-sm text-primary font-bold">
                    C-08-14
                  </td>
                  <td class="px-4 py-5">
                    <div class="flex flex-col gap-1.5 w-32">
                      <div class="flex justify-between text-[10px] font-bold">
                        <span>42 Units</span>
                        <span class="text-on-secondary-container">
                          IN STOCK
                        </span>
                      </div>
                      <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div class="h-full bg-primary rounded-full w-[65%]"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-5 font-headline font-bold text-on-surface-variant">
                    12
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button class="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          visibility
                        </span>
                      </button>
                      <button class="p-2 hover:bg-secondary-container/50 text-secondary rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stock Trends */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-lg">Stock Trends</h3>
              <span className="text-xs font-bold text-blue-600 px-3 py-1 bg-blue-100 rounded-full">
                LAST 30 DAYS
              </span>
            </div>

            <div className="h-48 w-full flex items-end gap-3 pb-4">
              <div className="flex-1 bg-gray-200 h-[40%] rounded"></div>
              <div className="flex-1 bg-gray-200 h-[55%] rounded"></div>
              <div className="flex-1 bg-gray-200 h-[45%] rounded"></div>
              <div className="flex-1 bg-blue-500 h-[75%] rounded"></div>
              <div className="flex-1 bg-gray-200 h-[60%] rounded"></div>
              <div className="flex-1 bg-gray-200 h-[50%] rounded"></div>
            </div>
          </div>

          {/* Audit Card */}
          <div className="bg-blue-600 p-8 rounded-3xl text-white">
            <h3 className="text-2xl font-black mb-2">
              Inventory Audit Required
            </h3>

            <p className="text-blue-100 text-sm">
              Zone B (Hydraulics) is scheduled for a cyclic count. Complete by
              EOD Friday to maintain 100% compliance status.
            </p>

            <button className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl text-sm mt-6">
              Start Audit Now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
