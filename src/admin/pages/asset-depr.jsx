// AssetDepreciationDashboard.jsx
import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import Header from "../components/header";
import API_BASE_URL from "../../API";

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
} from "../../helpers/depreciationHelper";

const AssetDepreciationDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxFiscalYear, setMaxFiscalYear] = useState(new Date().getFullYear());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    new Date().getFullYear(),
  );
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showFullLife, setShowFullLife] = useState(false);
  const [dateSortOrder, setDateSortOrder] = useState(null);
  const [purchasedYear, setPurchasedYear] = useState("ALL");
  const [showCurrentFYOnly, setShowCurrentFYOnly] = useState(false);

  // FIX 1: stickyCols widths must match what you set on every cell via style.
  // These are the px widths of the first 7 frozen columns.
  const stickyCols = [170, 120, 85, 65, 120, 120, 20];
  const leftOffsets = stickyCols.reduce((acc, w, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + stickyCols[i - 1]);
    return acc;
  }, []);

  // The total frozen width — used as minWidth so the table overflows correctly
  const frozenWidth = stickyCols.reduce((a, b) => a + b, 0);

  const formatMoney = (v) =>
    new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2 }).format(v || 0);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/asset/get/all`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setAssets(data);

        let lastYear = new Date().getFullYear();
        data.forEach((a) => {
          const schedule = getMonthlySchedule(a);
          if (schedule.length) {
            const last = schedule[schedule.length - 1];
            lastYear = Math.max(lastYear, last.year);
          }
        });
        setMaxFiscalYear(lastYear);
      } catch (err) {
        console.error(err);
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

  const fiscalStart = new Date(selectedFiscalYear, 5, 1);
  const fiscalEnd = new Date(selectedFiscalYear + 1, 4, 31);

  let filteredAssets = assets.filter((a) => {
    const categoryMatch =
      selectedCategory === "ALL" || a.category === selectedCategory;
    if (!a.purchaseDate) return false;
    const purchase = new Date(a.purchaseDate);
    const purchaseYear = purchase.getFullYear();
    const purchasedYearMatch =
      purchasedYear === "ALL" || purchaseYear === Number(purchasedYear);
    if (!purchasedYearMatch) return false;
    if (!showCurrentFYOnly) return categoryMatch;
    const inFiscalYear = purchase >= fiscalStart && purchase <= fiscalEnd;
    return categoryMatch && inFiscalYear;
  });

  if (dateSortOrder) {
    filteredAssets.sort((a, b) => {
      const dateA = a.purchaseDate ? new Date(a.purchaseDate) : new Date(0);
      const dateB = b.purchaseDate ? new Date(b.purchaseDate) : new Date(0);
      return dateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  const timeline = showFullLife ? getCompleteTimeline(filteredAssets) : null;
  const headerMonths = showFullLife
    ? []
    : selectedQuarter === "ALL"
      ? fiscalMonths
      : quarterMap[selectedQuarter];

  const rowData = filteredAssets.map((asset) => {
    const schedule = getMonthlySchedule(asset);
    const beginningNBV = getBeginningNBV(asset, selectedFiscalYear);
    const endingNBV = getNBVForPeriod(
      asset,
      selectedFiscalYear,
      selectedQuarter === "ALL" ? "ALL" : Number(selectedQuarter),
    );

    const deps = showFullLife
      ? timeline.map((t) => {
          const e = schedule.find(
            (s) => s.year === t.year && s.month === t.month,
          );
          return e ? e.dep : 0;
        })
      : selectedQuarter === "ALL"
        ? getScheduleForFiscalYear(schedule, selectedFiscalYear)
        : getScheduleForQuarter(
            schedule,
            selectedFiscalYear,
            Number(selectedQuarter),
          );

    const periodTotal = deps.reduce((a, b) => a + b, 0);
    return { asset, schedule, beginningNBV, endingNBV, deps, periodTotal };
  });

  const totalCost = rowData.reduce(
    (sum, r) => sum + (Number(r.asset.assetCost) || 0),
    0,
  );
  const totalBegNBV = rowData.reduce((sum, r) => sum + r.beginningNBV, 0);
  const totalEndNBV = rowData.reduce((sum, r) => sum + r.endingNBV, 0);
  const totalPeriodDep = rowData.reduce((sum, r) => sum + r.periodTotal, 0);

  const colCount = showFullLife
    ? timeline
      ? timeline.length
      : 0
    : headerMonths.length;
  const monthlyTotals = Array.from({ length: colCount }, (_, i) =>
    rowData.reduce((sum, r) => sum + (r.deps[i] || 0), 0),
  );

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Depreciation");
    sheet.views = [{ state: "frozen", xSplit: 7, ySplit: 2 }];

    const headerLabels = showFullLife
      ? timeline.map((t) => t.label)
      : headerMonths.map((m) => months[m]);

    const totalColumns = 7 + headerLabels.length + 1;

    const titleRow = sheet.addRow(["Asset Depreciation Report"]);
    titleRow.font = { bold: true, size: 16 };
    sheet.mergeCells(1, 1, 1, totalColumns);
    titleRow.alignment = { horizontal: "center" };

    const purchaseFilterNote = showCurrentFYOnly
      ? " (All purchased this fiscal year)"
      : "";
    const fiscalRow = sheet.addRow([
      showFullLife
        ? `Full Lifespan View${purchaseFilterNote}`
        : `Fiscal Year: ${selectedFiscalYear}-${selectedFiscalYear + 1} ${
            selectedQuarter !== "ALL"
              ? `– Quarter: Q${selectedQuarter}`
              : "(Full Fiscal Year)"
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
      8,
      20,
      18,
      18,
      ...Array(headerLabels.length).fill(12),
      18,
    ];
    sheet.columns.forEach((col, i) => {
      col.width = columnWidths[i] || 10;
    });

    const headers = [
      "Particulars",
      "Class",
      "Date",
      "Life",
      "Cost",
      "Beg. NBV",
      "End NBV",
      ...headerLabels,
      "Acc. Depr",
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    rowData.forEach(({ asset, deps, beginningNBV, endingNBV, periodTotal }) => {
      const row = sheet.addRow([
        asset.assetName,
        asset.category,
        asset.purchaseDate
          ? new Date(asset.purchaseDate).toLocaleDateString("en-PH")
          : "-",
        asset.lifeSpan,
        asset.assetCost,
        beginningNBV,
        endingNBV,
        ...deps,
        periodTotal,
      ]);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (
          [5, 6, 7, ...deps.map((_, i) => 8 + i), totalColumns].includes(
            colNumber,
          )
        ) {
          cell.numFmt = "#,##0.00";
          cell.alignment = { horizontal: "right" };
        }
      });
    });

    const totalsRow = sheet.addRow([
      "TOTAL",
      "",
      "",
      "",
      totalCost,
      totalBegNBV,
      totalEndNBV,
      ...monthlyTotals,
      totalPeriodDep,
    ]);
    totalsRow.font = { bold: true };
    totalsRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber >= 5) {
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
        : `AssetDepreciation_${selectedFiscalYear}_${selectedQuarter}.xlsx`,
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

  // ── Shared style helpers ──────────────────────────────────────────────────
  // The last frozen column (index 6, End NBV) gets a right border as a visual
  // divider between the frozen zone and the scrollable columns.
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
        <main className="p-6 space-y-6">
          {/* Filters */}
          <section className="mb-10 grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 md:col-span-8 flex flex-wrap gap-8 items-end bg-surface-container-lowest p-2 rounded-xl editorial-shadow">
              <div className="flex flex-wrap gap-4 items-end bg- dark:bg-slate-800 p-4 rounded-xl dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold block text-on-surface-variant uppercase tracking-widest">
                    Fiscal Year
                  </label>
                  <select
                    disabled={showFullLife}
                    value={selectedFiscalYear}
                    onChange={(e) =>
                      setSelectedFiscalYear(Number(e.target.value))
                    }
                    className="rounded-lg border px-2 py-1 dark:bg-slate-900"
                  >
                    {Array.from(
                      { length: maxFiscalYear - 2020 + 1 },
                      (_, i) => 2020 + i,
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}-{y + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block text-on-surface-variant uppercase tracking-widest">
                    Period
                  </label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="rounded-lg border px-2 py-1 dark:bg-slate-900"
                  >
                    <option value="ALL">Fiscal Year</option>
                    {Object.entries(quarterMap).map(([q, qMonths]) => (
                      <option key={q} value={q}>
                        Q{q} ({qMonths.map((m) => months[m]).join(" - ")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs block font-bold text-on-surface-variant uppercase tracking-widest">
                    Asset Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-lg border px-2 py-1 dark:bg-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block text-on-surface-variant uppercase tracking-widest">
                    Purchased Year
                  </label>
                  <select
                    value={purchasedYear}
                    onChange={(e) => setPurchasedYear(e.target.value)}
                    className="rounded-lg border px-2 py-1 dark:bg-slate-900"
                  >
                    <option value="ALL">ALL</option>
                    {Array.from(
                      { length: maxFiscalYear - 2019 },
                      (_, i) => 2020 + i,
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="text-sm gap-2 flex items-center font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showFullLife}
                    onChange={(e) => setShowFullLife(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500/20 w-5 h-5 border-slate-300"
                  />
                  Show Full Lifespan
                </label>

                <label className="text-sm gap-2 flex items-center font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showCurrentFYOnly}
                    onChange={(e) => setShowCurrentFYOnly(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500/20 w-5 h-5 border-slate-300"
                  />
                  Purchased this Fiscal Year
                </label>

                <button
                  onClick={exportToExcel}
                  className="ml-auto bg-emerald-600 text-white px-4 py-2 rounded-lg"
                >
                  Export to Excel
                </button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-on-tertiary-fixed-variant uppercase tracking-widest mb-1">
                  Active Asset Value
                </p>
                <h3 className="text-2xl font-headline font-extrabold text-on-tertiary-fixed">
                  $1,428,950.00
                </h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-600">
                <span
                  className="material-symbols-outlined text-3xl"
                  data-icon="account_balance_wallet"
                  data-weight="fill"
                >
                  account_balance_wallet
                </span>
              </div>
            </div>
          </section>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 w-full rounded-xl border dark:border-slate-700 overflow-hidden">
            {/*
                FIX 2: overflow-x: auto lives here on the wrapper div (already correct).
                FIX 3: The <table> no longer has w-48 or the broken "table-" class.
                      Instead it uses border-collapse and a large enough minWidth so
                      horizontal scrolling actually triggers. The frozen 7 cols occupy
                      `frozenWidth` px; the rest is for the dynamic month columns.
              */}
            <div className="overflow-x-auto">
              <table
                className="text-xs border-collapse"
                style={{ minWidth: `${frozenWidth + colCount * 90 + 160}px` }}
              >
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700 text-xs uppercase tracking-wider">
                    {/* ── Frozen columns ─────────────────────────── */}
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
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(3)}
                    >
                      Life mos.
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(4)}
                    >
                      Cost
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(5)}
                    >
                      Beg. NBV
                    </th>
                    {/* FIX 4: Last frozen column gets the visual right-border divider */}
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={stickyTh(6)}
                    >
                      End NBV
                    </th>

                    {/* ── Scrollable month columns ────────────────── */}
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
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-slate-700">
                  {rowData.map(
                    ({ asset, beginningNBV, endingNBV, deps, periodTotal }) => (
                      <tr
                        key={asset._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/40"
                      >
                        {/* ── Frozen cells ──────────────────────────── */}
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
                            ? new Date(asset.purchaseDate).toLocaleDateString(
                                "en-PH",
                              )
                            : "-"}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 text-slate-500 px-4 py-3 text-[10px] font-medium"
                          style={stickyTd(3)}
                        >
                          {asset.lifeSpan}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 font-medium text-[10px] text-slate-800"
                          style={stickyTd(4)}
                        >
                          {formatMoney(asset.assetCost)}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-right text-indigo-600 font-semibold text-[10px]"
                          style={stickyTd(5)}
                        >
                          {formatMoney(beginningNBV)}
                        </td>
                        {/* FIX 4: divider on last frozen cell */}
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-right text-blue-600 font-semibold text-[10px]"
                          style={stickyTd(6)}
                        >
                          {formatMoney(endingNBV)}
                        </td>

                        {/* ── Scrollable dep cells ──────────────────── */}
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
                      </tr>
                    ),
                  )}
                </tbody>

                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-700 font-bold border-t-2 border-slate-300 dark:border-slate-500">
                    {/*
                        FIX 5: Replace the single colSpan={4} cell with 4 individual cells.
                        colSpan breaks sticky positioning — each cell must have its own
                        explicit left offset and width for the browser to honour position:sticky.
                      */}
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
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={stickyTd(3)}
                    />

                    {/* Total Cost */}
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right text-[10px] font-extrabold text-slate-800 dark:text-slate-100"
                      style={stickyTd(4)}
                    >
                      {formatMoney(totalCost)}
                    </td>

                    {/* Total Beg. NBV */}
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300"
                      style={stickyTd(5)}
                    >
                      {formatMoney(totalBegNBV)}
                    </td>

                    {/* Total End NBV — last frozen cell, gets divider */}
                    <td
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right text-xs font-extrabold text-blue-700 dark:text-blue-300"
                      style={stickyTd(6)}
                    >
                      {formatMoney(totalEndNBV)}
                    </td>

                    {/* Per-month totals */}
                    {monthlyTotals.map((mt, i) => (
                      <td
                        key={i}
                        className="px-2 py-3 text-center text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-blue-50 dark:bg-blue-900/30"
                      >
                        {mt > 0 ? formatMoney(mt) : "-"}
                      </td>
                    ))}

                    {/* Total Accumulated Depr. */}
                    <td className="px-4 py-3 text-right text-xs font-extrabold text-green-600 dark:text-green-400">
                      {formatMoney(totalPeriodDep)}
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

export default AssetDepreciationDashboard;
