// InventoryReport.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getTotalAssets,
  getTotalValue,
  getCategoryConditionStats,
  getCriticalAssets,
  getOverallHealth,
  getAssetCategoryHealth,
} from "../../../utils/inventoryReportHelper";
import { fetchAssetsService } from "../../../services/assetService";
import { formatCriticalAssets } from "../../../utils/inventoryReportHelper";
import html2pdf from "html2pdf.js";

const InventoryReport = () => {
  const reportRef = useRef();

  const load = async () => {
    setLoading(true);
    const data = await fetchAssetsService();
    setAssets(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const totalAssets = getTotalAssets(assets);
  const totalValue = getTotalValue(assets);
  const categoryStats = getCategoryConditionStats(assets);
  const criticalAssets = getCriticalAssets(assets);
  const overallHealth = getOverallHealth(assets);
  const categoryHealth = getAssetCategoryHealth(assets);
  const formattedCriticalAssets = formatCriticalAssets(criticalAssets);

  const handleExportPDF = () => {
    const element = reportRef.current;

    // 👇 add export mode
    document.body.classList.add("exporting");

    const opt = {
      margin: 0.3,
      filename: "Inventory_Report.pdf",
      image: { type: "jpeg", quality: "100%" },
      html2canvas: {
        scale: 4, // keep this lower
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.classList.remove("exporting");
      });
  };

  return (
    <div className="flex min-h-screen bg-surface dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-background-dark/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              assessment
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              Comprehensive Inventory Condition Summary
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary">
                search
              </span>
              <input
                className="pl-10 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64"
                placeholder="Search assets..."
                type="text"
              />
            </div>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
              <span className="material-symbols-outlined text-[18px]">
                print
              </span>
              Print Report
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* Report Content */}
        <div
          ref={reportRef}
          className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8 report-container"
        >
          {/* Title & Export */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-extrabold">
                Inventory Health Summary
              </h2>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  calendar_today
                </span>
                Reporting Period: Jan 1, 2024 - Dec 31, 2024
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined text-[18px]">
                  share
                </span>
                Share
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Export PDF
              </button>
            </div>
          </div>

          {/* Top-level Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Total Assets */}
            <div className="bg- dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                {/* <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">inventory</span>
                </div> */}
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                  +2.5%
                </span>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Total Assets
              </p>
              <h3 className="text-3xl font-extrabold text-black font-headline">
                {totalAssets}
              </h3>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Total Active Asset
              </p>
            </div>
            {/* Total Value */}
            <div className="bg- dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                {/* <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">payments</span>
                </div> */}
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-full">
                  -0.8%
                </span>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Total Value
              </p>
              <h3 className="text-3xl text-primary font-extrabold mt-1">
                ₱{totalValue.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Gross book value of all active assets
              </p>
            </div>
            {/* Overall Health */}
            <div className="bg-  dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                {/* <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">favorite</span>
                </div> */}
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-full">
                  -1.2%
                </span>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Overall Health
              </p>
              <h3 className="text-3xl text-green1 font-extrabold mt-1">
                {overallHealth}%
              </h3>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Overall Health of Active Assets
              </p>
            </div>

            {/* Critical Issues */}
            <div className="bg-red dark:bg-slate-800 p-6 rounded-xl border  dark:border-slate-700 shadow-sm  ring-rose-500/20">
              <div className="flex justify-between items-start mb-4">
                {/* <div className="p-2 bg-rose-100 dark:bg-rose-500/10 rounded-lg text-rose-600 dark:text-rose-400">
                  <span className="material-symbols-outlined">
                    report_problem
                  </span>
                </div> */}
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-full">
                  +2 New
                </span>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Critical Issues
              </p>
              <h3 className="text-3xl font-extrabold mt-1 text-white">
                {criticalAssets.length}
              </h3>
              <p className="text-xs text-slate-300 mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Assets in Critical Condition
              </p>
            </div>
          </div>

          {/* Condition by Category */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h4 className="text-xl font-extrabold  mb-6">
                Condition by Category
              </h4>
              <div className="space-y-6">
                {categoryStats.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>{cat.category}</span>
                      <span className="text-primary">
                        {Math.round(cat.goodPercent)}% Healthy
                      </span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-full flex overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${cat.goodPercent}%` }}
                      ></div>
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${cat.maintenancePercent}%` }}
                      ></div>
                      <div
                        className="h-full bg-rose-500"
                        style={{ width: `${cat.disposalPercent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-4 text-[11px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500"></span>
                  Good
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-400"></span>Fair
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500"></span>
                  Critical
                </div>
              </div>
            </div>

            {/* Asset Category Health Table */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h4 className="text-xl font-extrabold">
                  Asset Category Health
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Category Name</th>
                      <th className="px-6 py-4">Total Units</th>
                      <th className="px-6 py-4">Average Health</th>
                      <th className="px-6 py-4">Maintenance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {categoryHealth.map((c) => (
                      <tr
                        key={c.category}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold">
                          {c.category}
                        </td>
                        <td className="px-6 py-4">{c.totalUnits}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                c.averageHealth >= 85
                                  ? "text-emerald-600"
                                  : c.averageHealth >= 60
                                    ? "text-amber-600"
                                    : "text-rose-600"
                              }`}
                            >
                              {c.averageHealth}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  c.averageHealth >= 85
                                    ? "bg-emerald-500"
                                    : c.averageHealth >= 60
                                      ? "bg-amber-400"
                                      : "bg-rose-500"
                                }`}
                                style={{ width: `${c.averageHealth}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              c.breakdown.maintenancePercent +
                                c.breakdown.disposalPercent >
                              0
                                ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {c.maintenanceStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Critical Assets */}
          <div className="mt-8 mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-rose-500">
                warning
              </span>
              <h4 className="text-2xl font-extrabold">
                Critical Assets Requiring Attention
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Example Asset Cards */}
              {formattedCriticalAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-y border-r shadow-sm
      ${
        asset.statusColor === "rose"
          ? "border-l-rose-500 border-slate-200 dark:border-slate-700"
          : asset.statusColor === "amber"
            ? "border-l-amber-500 border-slate-200 dark:border-slate-700"
            : "border-l-emerald-500 border-slate-200 dark:border-slate-700"
      }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Asset ID: {asset.assetTag}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
          ${
            asset.statusColor === "rose"
              ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
              : asset.statusColor === "amber"
                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
                    >
                      {asset.status}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 dark:text-white">
                    {asset.name}
                  </h5>

                  <p className="text-sm text-slate-500 mt-1 italic">
                    "{asset.issue}"
                  </p>
                  <p className="text-sm text-slate-500 mt-1 italic">
                    {asset.issuedDate
                      ? new Date(asset.issuedDate).toLocaleDateString()
                      : "-"}
                  </p>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-400">
                      {asset.assignedTo}
                    </span>
                    <button className="text-primary text-xs font-bold hover:underline">
                      {asset.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-2xl border border-primary/20 flex flex-col items-center text-center">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Inventory Management Insight
            </h4>
            <p className="max-w-2xl text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Overall inventory health remains stable at{" "}
              <span className="text-primary font-bold">92%</span>. Critical
              issues have increased by 3 units this quarter, primarily driven by
              IT hardware reaching end-of-life cycles. We recommend prioritizing
              the replacement of Critical IT assets to avoid operational
              downtime in Q3.
            </p>
            <div className="flex gap-4 mt-6">
              <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                Download Detailed CSV
              </button>
              <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-shadow">
                View Full Asset Log
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InventoryReport;
