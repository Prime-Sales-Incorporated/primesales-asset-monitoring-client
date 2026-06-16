// AssetDepreciationDashboard.jsx
import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import API_BASE_URL from "../../../API";

import {
  getMonthlySchedule,
  getNBVForPeriod,
  getBeginningNBV,
  getScheduleForQuarter,
  getScheduleForFiscalYear,
  getCompleteTimeline,
  months,
  fiscalMonths,
  quarterMap,
} from "../../../helpers/OCSIdepreciationHelper";

// ─── Grouping helper ────────────────────────────────────────────────────────
// Assets with the same name, purchaseDate, and assetCost are collapsed into one
// "grouped" entry. Depreciation / NBV values are scaled by qty.
const groupAssets = (assets) => {
  const map = new Map();

  assets.forEach((asset) => {
    const name = (asset.assetName || "").trim();
    const date = asset.purchaseDate
      ? new Date(asset.purchaseDate).toISOString().slice(0, 10)
      : "";
    const cost = Number(asset.assetCost || 0).toFixed(2);
    const key = `${name}||${date}||${cost}`;

    if (map.has(key)) {
      map.get(key).qty += 1;
    } else {
      map.set(key, { ...asset, qty: 1 });
    }
  });

  return Array.from(map.values());
};
// ────────────────────────────────────────────────────────────────────────────

const OCSIAssetDepreciationDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showFullLife, setShowFullLife] = useState(false);
  const [dateSortOrder, setDateSortOrder] = useState(null);
  const [purchasedYear, setPurchasedYear] = useState("ALL");
  const [showCurrentYearOnly, setShowCurrentYearOnly] = useState(false);
  const [hideZeroDepreciation, setHideZeroDepreciation] = useState(false);

  // 7 frozen columns
  const stickyCols = [170, 120, 85, 45, 100, 120, 120];
  const leftOffsets = stickyCols.reduce((acc, w, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + stickyCols[i - 1]);
    return acc;
  }, []);
  const frozenWidth = stickyCols.reduce((a, b) => a + b, 0);

  const formatMoney = (v) =>
    new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(v || 0);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/ocsi/asset/get/all?limit=10000`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
          },
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.assets ?? []);

        setAssets(list);

        let lastYear = new Date().getFullYear();
        list.forEach((a) => {
          const schedule = getMonthlySchedule(a);
          if (schedule.length) {
            const last = schedule[schedule.length - 1];
            lastYear = Math.max(lastYear, last.year);
          }
        });
        setMaxYear(lastYear);
      } catch (err) {
        console.error(err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const categories = [
    "ALL",
    ...new Set(assets.map((a) => a.category).filter(Boolean)),
  ];

  // Calendar year boundaries
  const yearStart = new Date(selectedYear, 0, 1); // Jan 1
  const yearEnd = new Date(selectedYear, 11, 31); // Dec 31

  // 1. Filter raw assets
  let filteredAssets = assets.filter((a) => {
    const categoryMatch =
      selectedCategory === "ALL" || a.category === selectedCategory;
    if (!a.purchaseDate) return false;
    const purchase = new Date(a.purchaseDate);
    const purchaseYear = purchase.getFullYear();
    const purchasedYearMatch =
      purchasedYear === "ALL" || purchaseYear === Number(purchasedYear);
    if (!purchasedYearMatch) return false;
    if (!showCurrentYearOnly) return categoryMatch;
    const inYear = purchase >= yearStart && purchase <= yearEnd;
    return categoryMatch && inYear;
  });

  // 2. Group into unique entries with qty
  let groupedAssets = groupAssets(filteredAssets);

  if (dateSortOrder) {
    groupedAssets.sort((a, b) => {
      const dateA = a.purchaseDate ? new Date(a.purchaseDate) : new Date(0);
      const dateB = b.purchaseDate ? new Date(b.purchaseDate) : new Date(0);
      return dateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  const timeline = showFullLife ? getCompleteTimeline(groupedAssets) : null;
  const headerMonths = showFullLife
    ? []
    : selectedQuarter === "ALL"
      ? fiscalMonths
      : quarterMap[selectedQuarter];

  // Derive the quarter number to pass to helpers (null when "ALL")
  const quarterNum = selectedQuarter === "ALL" ? null : Number(selectedQuarter);

  // 3. Build row data — multiply all monetary values by qty
  const rowData = groupedAssets.map((asset) => {
    const { qty = 1 } = asset;
    const schedule = getMonthlySchedule(asset);

    // ── KEY FIX: pass quarterNum so Beg. NBV reflects end of previous quarter ──
    const unitBeginningNBV = getBeginningNBV(asset, selectedYear, quarterNum);

    const unitEndingNBV = getNBVForPeriod(
      asset,
      selectedYear,
      selectedQuarter === "ALL" ? "ALL" : quarterNum,
    );

    const unitDeps = showFullLife
      ? timeline.map((t) => {
          const e = schedule.find(
            (s) => s.year === t.year && s.month === t.month,
          );
          return e ? e.dep : 0;
        })
      : selectedQuarter === "ALL"
        ? getScheduleForFiscalYear(schedule, selectedYear)
        : getScheduleForQuarter(schedule, selectedYear, quarterNum);

    const beginningNBV = unitBeginningNBV * qty;
    const endingNBV = unitEndingNBV * qty;
    const deps = unitDeps.map((d) => d * qty);
    const periodTotal = deps.reduce((a, b) => a + b, 0);

    return { asset, schedule, beginningNBV, endingNBV, deps, periodTotal };
  });

  const visibleRowData = hideZeroDepreciation
    ? rowData.filter((r) => r.periodTotal > 0)
    : rowData;

  const totalCost = visibleRowData.reduce(
    (sum, r) => sum + (Number(r.asset.assetCost) || 0) * (r.asset.qty || 1),
    0,
  );
  const totalBegNBV = visibleRowData.reduce(
    (sum, r) => sum + r.beginningNBV,
    0,
  );
  const totalEndNBV = visibleRowData.reduce((sum, r) => sum + r.endingNBV, 0);
  const totalPeriodDep = visibleRowData.reduce(
    (sum, r) => sum + r.periodTotal,
    0,
  );

  const colCount = showFullLife
    ? timeline
      ? timeline.length
      : 0
    : headerMonths.length;

  const monthlyTotals = Array.from({ length: colCount }, (_, i) =>
    visibleRowData.reduce((sum, r) => sum + (r.deps[i] || 0), 0),
  );

  // ── Summary card label: changes based on quarter selection ──────────────
  const begBalLabel = quarterNum
    ? `Beg. Bal. as of end of Q${quarterNum - 1 || 4} ${
        quarterNum === 1 ? selectedYear - 1 : selectedYear
      }`
    : `Beg. Bal. as of Dec 31, ${selectedYear - 1}`;

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Depreciation");
    sheet.views = [{ state: "frozen", xSplit: 7, ySplit: 2 }];

    const headerLabels = showFullLife
      ? timeline.map((t) => t.label)
      : headerMonths.map((m) => months[m]);

    const totalColumns = 7 + headerLabels.length + 2;

    const titleRow = sheet.addRow(["Asset Depreciation Report"]);
    titleRow.font = { bold: true, size: 16 };
    sheet.mergeCells(1, 1, 1, totalColumns);
    titleRow.alignment = { horizontal: "center" };

    const purchaseFilterNote = showCurrentYearOnly
      ? " (All purchased this calendar year)"
      : "";
    const fiscalRow = sheet.addRow([
      showFullLife
        ? `Full Lifespan View${purchaseFilterNote}`
        : `Calendar Year: ${selectedYear} ${
            selectedQuarter !== "ALL"
              ? `– Quarter: Q${selectedQuarter} (${quarterMap[selectedQuarter].map((m) => months[m]).join(" - ")})`
              : "(Full Year)"
          }${purchaseFilterNote}`,
    ]);
    fiscalRow.font = { bold: true };
    sheet.mergeCells(2, 1, 2, totalColumns);
    fiscalRow.alignment = { horizontal: "center" };
    fiscalRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
    });

    const columnWidths = [
      20,
      12,
      12,
      6,
      8,
      20,
      18,
      ...Array(headerLabels.length).fill(12),
      18,
      18,
    ];
    sheet.columns.forEach((col, i) => {
      col.width = columnWidths[i] || 10;
    });

    const headers = [
      "Particulars",
      "Class",
      "Date",
      "Qty",
      "Life",
      "Total Cost",
      "Beg. NBV",
      ...headerLabels,
      "Acc. Depr",
      "End NBV",
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    visibleRowData.forEach(
      ({ asset, deps, beginningNBV, endingNBV, periodTotal }) => {
        const qty = asset.qty || 1;
        const totalAssetCost = (Number(asset.assetCost) || 0) * qty;
        const row = sheet.addRow([
          asset.assetName,
          asset.category,
          asset.purchaseDate
            ? new Date(asset.purchaseDate).toLocaleDateString("en-PH")
            : "-",
          qty,
          asset.lifeSpan,
          totalAssetCost,
          beginningNBV,
          ...deps,
          periodTotal,
          endingNBV,
        ]);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (
            [
              6,
              7,
              ...deps.map((_, i) => 8 + i),
              totalColumns - 1,
              totalColumns,
            ].includes(colNumber)
          ) {
            cell.numFmt = "#,##0.00";
            cell.alignment = { horizontal: "right" };
          }
        });
      },
    );

    const totalsRow = sheet.addRow([
      "TOTAL",
      "",
      "",
      visibleRowData.reduce((sum, r) => sum + (r.asset.qty || 1), 0),
      "",
      totalCost,
      totalBegNBV,
      ...monthlyTotals,
      totalPeriodDep,
      totalEndNBV,
    ]);
    totalsRow.font = { bold: true };
    totalsRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber >= 6) {
        cell.numFmt = "#,##0.00";
        cell.alignment = { horizontal: "right" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "E2EFDA" },
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      showFullLife
        ? "AssetDepreciation_FullLifespan.xlsx"
        : `AssetDepreciation_${selectedYear}_${selectedQuarter}.xlsx`,
    );
  };

  const handleDateSort = () => {
    setDateSortOrder(dateSortOrder === "asc" ? "desc" : "asc");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading assets...
      </div>
    );

  const DIVIDER = "2px solid #cbd5e1";

  const stickyTh = (i, extra = {}) => ({
    left: leftOffsets[i],
    width: stickyCols[i],
    minWidth: stickyCols[i],
    ...(i === 6 ? { borderRight: DIVIDER } : {}),
    ...extra,
  });

  const stickyTd = (i, extra = {}) => ({
    left: leftOffsets[i],
    width: stickyCols[i],
    minWidth: stickyCols[i],
    ...(i === 6 ? { borderRight: DIVIDER } : {}),
    ...extra,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:text-slate-100">
      <div className="mx-auto w-[1366px] max-w-full">
        <main className="p-3 space-y-3">
          {/* Filters */}
          <section className="mb-3 grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 md:col-span-8 flex flex-wrap gap-2 items-center h-32 bg-surface-container-lowest p-1.5 rounded-lg editorial-shadow">
              <div className="flex flex-wrap gap-2 items-center dark:bg-slate-800 p-2 rounded-lg dark:border-slate-700">
                <div>
                  <label className="text-[10px] font-bold block text-on-surface-variant uppercase tracking-widest">
                    Calendar Year
                  </label>
                  <select
                    disabled={showFullLife}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="rounded border px-1.5 py-0.5 text-xs dark:bg-slate-900"
                  >
                    {Array.from(
                      { length: maxYear - 2020 + 1 },
                      (_, i) => 2020 + i,
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold block text-on-surface-variant uppercase tracking-widest">
                    Period
                  </label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="rounded border px-1.5 py-0.5 text-xs dark:bg-slate-900"
                  >
                    <option value="ALL">Full Year</option>
                    {Object.entries(quarterMap).map(([q, qMonths]) => (
                      <option key={q} value={q}>
                        Q{q} ({qMonths.map((m) => months[m]).join(" - ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] block font-bold text-on-surface-variant uppercase tracking-widest">
                    Asset Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded border px-1.5 py-0.5 text-xs dark:bg-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold block text-on-surface-variant uppercase tracking-widest">
                    Purchased Year
                  </label>
                  <select
                    value={purchasedYear}
                    onChange={(e) => setPurchasedYear(e.target.value)}
                    className="rounded border px-1.5 py-0.5 text-xs dark:bg-slate-900"
                  >
                    <option value="ALL">ALL</option>
                    {Array.from(
                      { length: maxYear - 2019 },
                      (_, i) => 2020 + i,
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="text-xs gap-1.5 flex items-center font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showFullLife}
                    onChange={(e) => setShowFullLife(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500/20 w-3.5 h-3.5 border-slate-300"
                  />
                  Show Full Lifespan
                </label>

                <label className="text-xs gap-1.5 flex items-center font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showCurrentYearOnly}
                    onChange={(e) => setShowCurrentYearOnly(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500/20 w-3.5 h-3.5 border-slate-300"
                  />
                  Purchased this Year
                </label>

                <label className="text-xs gap-1.5 flex items-center font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hideZeroDepreciation}
                    onChange={(e) => setHideZeroDepreciation(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500/20 w-3.5 h-3.5 border-slate-300"
                  />
                  Hide Zero Depreciation
                </label>

                <button
                  onClick={exportToExcel}
                  className="ml-auto bg-emerald-600 text-white px-3 py-1 text-xs rounded-lg hover:bg-emerald-700 transition"
                >
                  Export to Excel
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
              {/* Beg Bal — label updates based on quarter */}
              <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-0.5">
                    {begBalLabel}
                  </p>
                  <h3 className="text-base font-extrabold text-indigo-800">
                    {formatMoney(totalBegNBV)}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-400/20 flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined text-lg">
                    history
                  </span>
                </div>
              </div>

              {/* Total End NBV */}
              <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5">
                    Total End NBV
                  </p>
                  <h3 className="text-base font-extrabold text-emerald-800">
                    {formatMoney(totalEndNBV)}
                  </h3>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    {visibleRowData.reduce(
                      (sum, r) => sum + (r.asset.qty || 1),
                      0,
                    )}{" "}
                    asset
                    {visibleRowData.reduce(
                      (sum, r) => sum + (r.asset.qty || 1),
                      0,
                    ) !== 1
                      ? "s"
                      : ""}{" "}
                    ({visibleRowData.length} unique)
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-lg">
                    account_balance_wallet
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 w-full rounded-xl border dark:border-slate-700 overflow-hidden">
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(100vh - 180px)" }}
            >
              <table
                className="text-xs border-collapse"
                style={{ minWidth: `${frozenWidth + colCount * 90 + 280}px` }}
              >
                <thead className="sticky top-0 z-40">
                  <tr className="bg-slate-100 dark:bg-slate-700 text-xs uppercase tracking-wider">
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(0)}
                    >
                      Particulars
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(1)}
                    >
                      Class
                    </th>
                    <th
                      onClick={handleDateSort}
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 cursor-pointer select-none text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(2)}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {dateSortOrder === "asc" && <FaArrowUp />}
                        {dateSortOrder === "desc" && <FaArrowDown />}
                      </div>
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-2 py-3 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(3)}
                    >
                      Qty
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(4)}
                    >
                      Life mos.
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(5)}
                    >
                      Total Cost
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(6)}
                    >
                      Beg. NBV
                    </th>

                    {(showFullLife ? timeline : headerMonths).map((m, i) => (
                      <th
                        key={i}
                        className="px-2 py-3 text-center bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                        style={{ minWidth: 90 }}
                      >
                        {showFullLife ? m.label : months[m]}
                      </th>
                    ))}

                    <th
                      className="px-4 py-3 text-right text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={{ minWidth: 120 }}
                    >
                      Accumulated Depr.
                    </th>
                    <th
                      className="px-4 py-3 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-slate-100 dark:bg-slate-700"
                      style={{ minWidth: 120 }}
                    >
                      End NBV
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-slate-700">
                  {visibleRowData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7 + colCount + 2}
                        className="text-center py-12 text-slate-400"
                      >
                        No assets match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    visibleRowData.map(
                      ({
                        asset,
                        beginningNBV,
                        endingNBV,
                        deps,
                        periodTotal,
                      }) => {
                        const qty = asset.qty || 1;
                        const totalAssetCost =
                          (Number(asset.assetCost) || 0) * qty;
                        return (
                          <tr
                            key={`${asset._id}-${qty}`}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/40"
                          >
                            <td
                              className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-[10px] font-medium"
                              style={stickyTd(0)}
                            >
                              {asset.assetName}
                            </td>
                            <td
                              className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-slate-500 text-[10px] font-medium"
                              style={stickyTd(1)}
                            >
                              {asset.category}
                            </td>
                            <td
                              className="sticky z-20 bg-white dark:bg-slate-800 text-slate-500 px-4 py-3 text-[10px] font-medium"
                              style={stickyTd(2)}
                            >
                              {asset.purchaseDate
                                ? new Date(
                                    asset.purchaseDate,
                                  ).toLocaleDateString("en-PH")
                                : "-"}
                            </td>
                            <td
                              className="sticky z-20 bg-white dark:bg-slate-800 px-2 py-3 text-center text-[10px] font-bold text-amber-600"
                              style={stickyTd(3)}
                            >
                              {qty > 1 ? (
                                <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-bold text-[10px]">
                                  ×{qty}
                                </span>
                              ) : (
                                <span className="text-slate-400">1</span>
                              )}
                            </td>
                            <td
                              className="sticky z-20 bg-white dark:bg-slate-800 text-slate-500 px-4 py-3 text-[10px] font-medium"
                              style={stickyTd(4)}
                            >
                              {asset.lifeSpan}
                            </td>
                            <td
                              className="sticky z-20 bg-white dark:bg-slate-800 px-8 py-3 font-medium text-[10px] text-slate-800"
                              style={stickyTd(5)}
                            >
                              {formatMoney(totalAssetCost)}
                              {qty > 1 && (
                                <div className="text-[9px] text-slate-400 font-normal">
                                  {formatMoney(asset.assetCost)} × {qty}
                                </div>
                              )}
                            </td>
                            <td
                              className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-right text-indigo-600 font-semibold text-[10px]"
                              style={stickyTd(6)}
                            >
                              {formatMoney(beginningNBV)}
                            </td>

                            {deps.map((d, i) => (
                              <td
                                key={i}
                                className="px-2 py-3 text-center text-slate-600 text-[10px]"
                              >
                                {d > 0 ? formatMoney(d) : "-"}
                              </td>
                            ))}

                            <td className="px-4 py-3 text-right font-bold text-green-500 text-[10px]">
                              {formatMoney(periodTotal)}
                            </td>
                            <td className="px-4 py-3 text-right text-blue-600 font-semibold text-[10px]">
                              {formatMoney(endingNBV)}
                            </td>
                          </tr>
                        );
                      },
                    )
                  )}
                </tbody>

                <tfoot className="sticky bottom-0 z-40">
                  <tr className="bg-slate-100 dark:bg-slate-700 font-bold border-t-2 border-slate-300 dark:border-slate-500">
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider"
                      style={stickyTd(0)}
                    >
                      TOTAL
                    </td>
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={stickyTd(1)}
                    />
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={stickyTd(2)}
                    />
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-2 py-3 text-center text-[10px] font-extrabold text-amber-700 dark:text-amber-300"
                      style={stickyTd(3)}
                    >
                      {visibleRowData.reduce(
                        (sum, r) => sum + (r.asset.qty || 1),
                        0,
                      )}
                    </td>
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={stickyTd(4)}
                    />
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-8 py-3 text-right text-[10px] font-extrabold text-slate-800 dark:text-slate-100"
                      style={stickyTd(5)}
                    >
                      {formatMoney(totalCost)}
                    </td>
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300"
                      style={stickyTd(6)}
                    >
                      {formatMoney(totalBegNBV)}
                    </td>

                    {monthlyTotals.map((mt, i) => (
                      <td
                        key={i}
                        className="px-2 py-3 text-center text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-blue-50 dark:bg-blue-900/30"
                      >
                        {mt > 0 ? formatMoney(mt) : "-"}
                      </td>
                    ))}

                    <td className="px-4 py-3 text-right text-xs font-extrabold text-green-600 dark:text-green-400">
                      {formatMoney(totalPeriodDep)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-extrabold text-blue-700 dark:text-blue-300">
                      {formatMoney(totalEndNBV)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OCSIAssetDepreciationDashboard;
