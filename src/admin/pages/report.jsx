import React from "react";
import { Link } from "react-router-dom";

const ReportsAnalytics = () => {
  return (
    <main className="flex-1 p-8">
      {/* Header */}
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Generate and manage system-wide asset intelligence reports.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Schedule Report
          </button>
        </div>
      </header>

      {/* Report Cards */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        data-purpose="report-types"
      >
        {/* Card 1: Asset Condition */}
        <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">
            Asset Condition Report
          </h3>
          <p className="text-sm text-gray-500 mb-6 flex-grow">
            Comprehensive audit on forklift safety, maintenance logs, and
            physical inspection results.
          </p>

          <Link to="/reports/inventory">
            <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">
              Generate Report
            </button>
          </Link>
        </article>

        {/* Card 2: Financial & Depreciation */}
        <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">
            Financial & Depreciation
          </h3>
          <p className="text-sm text-gray-500 mb-6 flex-grow">
            Analyze asset valuation over time using Straight-Line or Double
            Declining methods.
          </p>
          <Link to="/reports/finance">
            {" "}
            <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">
              Generate Report
            </button>
          </Link>
        </article>

        {/* Card 3: Rental Utilization */}
        <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 10V3L4 14h7v7l9-11h-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Rental Utilization</h3>
          <p className="text-sm text-gray-500 mb-6 flex-grow">
            Track rental frequency, idle time, and revenue generated per asset
            category.
          </p>

          <Link to="/reports/inventory">
            <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">
              Generate Report
            </button>
          </Link>
        </article>

        {/* Card 4: Audit History */}
        <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Audit History</h3>
          <p className="text-sm text-gray-500 mb-6 flex-grow">
            Log of all recent asset scans, transfers, and warehouse check-ins/
            check-outs.
          </p>
          <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">
            Generate Report
          </button>
        </article>
      </section>

      {/* Recent Reports Table */}
      <section
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        data-purpose="recent-reports"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-lg">Recent Reports</h2>
          <div className="relative">
            <input
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search reports..."
              type="text"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Report Name</th>
                <th className="px-6 py-4 font-semibold">Date Generated</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Row 1 */}
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Q1_Depreciation_Analysis.pdf
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Mar 17, 2026
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    Financial
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">Ready</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    className="text-blue-600 hover:underline text-sm font-medium"
                    href="#"
                  >
                    Download
                  </a>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Weekly_Safety_Audit_W11.pdf
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Mar 15, 2026
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Condition
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">Ready</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    className="text-blue-600 hover:underline text-sm font-medium"
                    href="#"
                  >
                    Download
                  </a>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Annual_Inventory_Summary_2025.csv
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Mar 10, 2026
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                    Audit
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    <span className="text-sm text-gray-700">Pending</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-gray-400 italic text-sm">
                  Generating...
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Rental_Revenue_Tracking_Feb.xlsx
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Mar 02, 2026
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                    Rentals
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">Ready</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    className="text-blue-600 hover:underline text-sm font-medium"
                    href="#"
                  >
                    Download
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing 4 of 28 reports</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
              Prev
            </button>
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReportsAnalytics;
