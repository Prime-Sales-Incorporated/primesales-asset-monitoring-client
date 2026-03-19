import React from "react";

const FinanceReport = () => {
  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      {/* SIDEBAR */}

      {/* MAIN */}
      <main className="px-4 flex-1 flex flex-col">
        {/* HEADER */}
        <header className="bg-slate-50/80 backdrop-blur-md flex justify-between px-8 py-3 shadow-sm">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400">
              search
            </span>
            <input
              className="w-full bg-slate-200 rounded-full py-2 pl-10 pr-4"
              placeholder="Search..."
            />
          </div>

          <div className="flex gap-6 items-center">
            <span className="material-symbols-outlined">notifications</span>
            <span className="material-symbols-outlined">settings</span>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-10 space-y-10">
          {/* HEADER TOP */}
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-extrabold">
                Financial & Depreciation Report
              </h2>
              <p className="text-slate-500">Audit-ready documentation</p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3">
              <div className="flex bg-white p-1 rounded-xl border">
                <button className="px-4 py-2 bg-gray-200 rounded-lg">
                  Last 12 Months
                </button>
                <button className="px-4 py-2">Custom Range</button>
              </div>

              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl flex gap-2">
                <span className="material-symbols-outlined">
                  picture_as_pdf
                </span>
                Export PDF
              </button>
            </div>
          </div>

          {/* KPI WITH ICON BACKGROUND */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* KPI 1 */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_24px_40px_-15px_rgba(0,0,0,0.04)] border border-outline-variant/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-8xl">
                  account_balance_wallet
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Total Asset Value
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-primary font-headline">
                    $1.24B
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +4.2%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    info
                  </span>
                  Gross book value of all active assets
                </p>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_24px_40px_-15px_rgba(0,0,0,0.04)] border border-outline-variant/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-8xl">
                  history
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Accumulated Depreciation
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-tertiary font-headline">
                    $450.8M
                  </span>
                  <span className="text-xs font-bold text-slate-400 italic">
                    36% of Total
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    schedule
                  </span>
                  Total value lost over useful life cycles
                </p>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-primary text-white p-8 rounded-2xl shadow-xl shadow-blue-900/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-8xl">
                  savings
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">
                  Net Book Value
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-headline">
                    $792.2M
                  </span>
                </div>
                <p className="text-xs text-blue-100/70 mt-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  Active valuation for balance sheet
                </p>
              </div>
            </div>
          </div>

          {/* CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-3xl shadow-[0_24px_40px_-15px_rgba(0,0,0,0.04)] border border-outline-variant/10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-extrabold text-on-surface font-headline">
                    Projected Depreciation Trend
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Forecasted valuation loss over the next 12 months
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full"></span>
                    <span className="text-xs font-bold text-slate-600">
                      Net Value
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
                    <span className="text-xs font-bold text-slate-600">
                      Historical
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-[300px] w-full relative">
                <div className="absolute inset-0 flex items-end justify-between px-2">
                  <svg
                    className="absolute inset-0 h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 100"
                  >
                    <path
                      d="M0,20 Q25,25 50,45 T100,85"
                      fill="none"
                      stroke="#003d9b"
                      strokeWidth="3"
                      strokeLinecap="round"
                    ></path>

                    <path
                      d="M0,20 Q25,25 50,45 T100,85 V100 H0 Z"
                      fill="url(#chartGradient)"
                      opacity="0.1"
                    ></path>

                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#003d9b"></stop>
                        <stop offset="100%" stopColor="transparent"></stop>
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* X Axis */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter pt-4 transform translate-y-6">
                    <span>Jun '24</span>
                    <span>Sep '24</span>
                    <span>Dec '24</span>
                    <span>Mar '25</span>
                    <span>Jun '25</span>
                  </div>
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 flex justify-between opacity-5 pointer-events-none">
                  <div className="w-[1px] h-full bg-on-surface"></div>
                  <div className="w-[1px] h-full bg-on-surface"></div>
                  <div className="w-[1px] h-full bg-on-surface"></div>
                  <div className="w-[1px] h-full bg-on-surface"></div>
                  <div className="w-[1px] h-full bg-on-surface"></div>
                </div>
              </div>
            </div>

            {/* Secondary Chart */}
            <div className="lg:col-span-4 bg-surface-container-low p-8 rounded-3xl flex flex-col">
              <h3 className="text-xl font-extrabold text-on-surface font-headline mb-6">
                By Category
              </h3>

              <div className="space-y-8 flex-1">
                {/* Item 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-600">Heavy Machinery</span>
                    <span className="text-primary">$420M</span>
                  </div>
                  <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-600">IT Equipment</span>
                    <span className="text-primary">$210M</span>
                  </div>
                  <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-600">Office Furniture</span>
                    <span className="text-primary">$85M</span>
                  </div>
                  <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary-fixed-dim rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-600">Vehicle Fleet</span>
                    <span className="text-primary">$150M</span>
                  </div>
                  <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <button className="mt-8 text-sm font-bold text-primary flex items-center justify-center gap-1 hover:underline">
                View Detailed Analytics
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* CATEGORY */}

          {/* TABLE */}
          <section className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_24px_40px_-15px_rgba(0,0,0,0.04)] border border-outline-variant/10">
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-surface-container">
              <div>
                <h3 className="text-xl font-extrabold text-on-surface font-headline">
                  Asset Valuation Table
                </h3>
                <p className="text-slate-500 text-sm">
                  Detailed itemization of high-value assets
                </p>
              </div>

              <div className="flex gap-2">
                <button className="p-2 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-2 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Asset Name &amp; ID
                    </th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Category
                    </th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Original Cost
                    </th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Acc. Depreciation
                    </th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                      Net Book Value
                    </th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-surface-container">
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            precision_manufacturing
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            Excavator CAT-320D
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            ID: HM-99203-24
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-600">
                        Heavy Machinery
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-semibold text-sm">
                      $280,000
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-medium text-sm text-tertiary">
                      ($42,000)
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-bold text-sm text-primary">
                      $238,000
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-full tracking-wider">
                        Active
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            laptop_mac
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            MacBook Pro M3 Fleet
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            ID: IT-44021-24
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-600">
                        IT Equipment
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-semibold text-sm">
                      $1.2M
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-medium text-sm text-tertiary">
                      ($650,000)
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-bold text-sm text-primary">
                      $550,000
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold uppercase rounded-full tracking-wider">
                        Mid-Life
                      </span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            local_shipping
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            Mercedes-Benz Actros
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            ID: FL-00281-22
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-600">
                        Vehicle Fleet
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-semibold text-sm">
                      $185,000
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-medium text-sm text-tertiary">
                      ($160,000)
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-bold text-sm text-primary">
                      $25,000
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold uppercase rounded-full tracking-wider">
                        Expired
                      </span>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">
                            chair
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            Ergonomic Office Set
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            ID: OF-11200-24
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-600">
                        Office Furniture
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-semibold text-sm">
                      $45,000
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-medium text-sm text-tertiary">
                      ($5,000)
                    </td>
                    <td className="px-8 py-6 text-right font-inter font-bold text-sm text-primary">
                      $40,000
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase rounded-full tracking-wider">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Showing 4 of 1,240 Assets
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-outline-variant/30 rounded-lg hover:bg-slate-50">
                  Previous
                </button>
                <button className="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg shadow-sm">
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FinanceReport;
