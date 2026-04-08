// AssetDepreciationDashboard.jsx
import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";
import Header from "../components/header";
import API_BASE_URL from "../../API";

// Import your helpers
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
  const [dateSortOrder, setDateSortOrder] = useState(null); // null | "asc" | "desc"
  const [purchasedYear, setPurchasedYear] = useState("ALL");
  const [showCurrentFYOnly, setShowCurrentFYOnly] = useState(false);

  const stickyCols = [120, 85, 89, 65, 95, 90, 120]; // px
  const leftOffsets = stickyCols.reduce((acc, w, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + stickyCols[i - 1]);
    return acc;
  }, []);

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
            lastYear = Math.max(lastYear, last.year); // assume helper already maps fiscal year if needed
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

  const fiscalStart = new Date(selectedFiscalYear, 5, 1); // June 1
  const fiscalEnd = new Date(selectedFiscalYear + 1, 4, 31); // May 31

  let filteredAssets = assets.filter((a) => {
    const categoryMatch =
      selectedCategory === "ALL" || a.category === selectedCategory;

    if (!a.purchaseDate) return false;

    const purchase = new Date(a.purchaseDate);
    const purchaseYear = purchase.getFullYear();

    // Check Purchased Year filter
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

  let totalPeriodDep = 0;

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Depreciation");
    sheet.views = [{ state: "frozen", xSplit: 7, ySplit: 2 }];

    const headerLabels = showFullLife
      ? timeline.map((t) => t.label)
      : headerMonths.map((m) => months[m]);

    const totalColumns = 7 + headerLabels.length + 1; // first 7 + months + Total

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
    // Define widths for your columns
    const columnWidths = [
      20, // Particulars
      12, // Class
      12, // Date
      8, // Life
      20, // Cost
      18, // Beg. NBV
      18, // End NBV
      // monthly columns will all be 10
      ...Array(headerLabels.length).fill(12),
      18, // Acc. Depr
    ];

    // Apply widths
    sheet.columns.forEach((col, i) => {
      col.width = columnWidths[i] || 10; // default 10 if undefined
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

    filteredAssets.forEach((asset) => {
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

  // const quarterMap = {
  //   1: "Jun - Aug",
  //   2: "Sep - Nov",
  //   3: "Dec - Feb",
  //   4: "Mar - May",
  // };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:text-slate-100">
      <div className="mx-auto w-[1366px] max-w-full">
        <main className="p-6 space-y-6">
          {/* Filters */}
          {/* <div className="flex flex-wrap gap-4 items-end bg- dark:bg-slate-800 p-4 rounded-xl  dark:border-slate-700">
            <div>
              <label class="text-xs font-bold block text-on-surface-variant uppercase tracking-widest">
                Fiscal Year
              </label>
              <select
                disabled={showFullLife}
                value={selectedFiscalYear}
                onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
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
              <label class="text-xs font-bold block text-on-surface-variant uppercase tracking-widest">
                Period
              </label>

              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="rounded-lg border px-2 py-1 dark:bg-slate-900"
              >
                <option value="ALL">Fiscal Year</option>
                {Object.entries(quarterMap).map(([q, months]) => (
                  <option key={q} value={q}>
                    Q{q} ({months})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label class="text-xs block font-bold text-on-surface-variant uppercase tracking-widest">
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

            <label
              class="text-sm gap-2 flex items-center font-semibold text-slate-700"
              for="lifespan"
            >
              <input
                type="checkbox"
                checked={showFullLife}
                onChange={(e) => setShowFullLife(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-500/20 w-5 h-5 border-slate-300"
              />
              Show Full Lifespan
            </label>

            <button
              onClick={exportToExcel}
              className="ml-auto bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              Export to Excel
            </button>
          </div> */}
          <section class="mb-10 grid grid-cols-12 gap-6 items-end">
            <div class="col-span-12 md:col-span-8 flex flex-wrap gap-8 items-end bg-surface-container-lowest p-2 rounded-xl editorial-shadow">
              <div className="flex flex-wrap gap-4 items-end bg- dark:bg-slate-800 p-4 rounded-xl  dark:border-slate-700">
                <div>
                  <label class="text-xs font-bold block text-on-surface-variant uppercase tracking-widest">
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
                  <label class="text-xs font-bold block text-on-surface-variant uppercase tracking-widest">
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
                  <label class="text-xs block font-bold text-on-surface-variant uppercase tracking-widest">
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

                <label
                  class="text-sm gap-2 flex items-center font-semibold text-slate-700"
                  for="lifespan"
                >
                  <input
                    type="checkbox"
                    checked={showFullLife}
                    onChange={(e) => setShowFullLife(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500/20 w-5 h-5 border-slate-300"
                  />
                  Show Full Lifespan
                </label>
                <label class="text-sm gap-2 flex items-center font-semibold text-slate-700">
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
            <div class="col-span-12 md:col-span-4 bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex justify-between items-center ">
              <div>
                <p class="text-xs font-bold text-on-tertiary-fixed-variant uppercase tracking-widest mb-1">
                  Active Asset Value
                </p>
                <h3 class="text-2xl font-headline font-extrabold text-on-tertiary-fixed">
                  $1,428,950.00
                </h3>
              </div>
              <div class="w-12 h-12 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-600">
                <span
                  class="material-symbols-outlined text-3xl"
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700 text-xs uppercase tracking-wider">
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={{ left: leftOffsets[0], width: stickyCols[0] }}
                    >
                      Particulars
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={{ left: leftOffsets[1], width: stickyCols[1] }}
                    >
                      Class
                    </th>
                    <th
                      onClick={handleDateSort}
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 cursor-pointer select-none text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={{ left: leftOffsets[2], width: stickyCols[2] }}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {dateSortOrder === "asc" && <FaArrowUp />}
                        {dateSortOrder === "desc" && <FaArrowDown />}
                      </div>
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={{ left: leftOffsets[3], width: stickyCols[3] }}
                    >
                      Life mos.
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"
                      style={{ left: leftOffsets[4], width: stickyCols[4] }}
                    >
                      Cost
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right"
                      style={{ left: leftOffsets[5], width: stickyCols[5] }}
                    >
                      Beg. NBV
                    </th>

                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3 text-right"
                      style={{ left: leftOffsets[6], width: stickyCols[6] }}
                    >
                      End NBV
                    </th>
                    {(showFullLife ? timeline : headerMonths).map((m, i) => (
                      <th
                        key={i}
                        className="px-2 py-3 text-center bg-blue-50 dark:bg-blue-900/20 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest"
                      >
                        {showFullLife ? m.label : months[m]}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Accumulated Depr.
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-slate-700">
                  {filteredAssets.map((asset) => {
                    const schedule = getMonthlySchedule(asset);
                    const beginningNBV = getBeginningNBV(
                      asset,
                      selectedFiscalYear,
                    );
                    const endingNBV = getNBVForPeriod(
                      asset,
                      selectedFiscalYear,
                      selectedQuarter === "ALL"
                        ? "ALL"
                        : Number(selectedQuarter),
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
                    totalPeriodDep += periodTotal;

                    return (
                      <tr
                        key={asset._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/40"
                      >
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-xs font-medium"
                          style={{ left: leftOffsets[0], width: stickyCols[0] }}
                        >
                          {asset.assetName}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-slate-500 text-xs font-medium"
                          style={{ left: leftOffsets[1], width: stickyCols[1] }}
                        >
                          {asset.category}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 text-slate-500  px-4 py-3 text-xs font-medium"
                          style={{ left: leftOffsets[2], width: stickyCols[2] }}
                        >
                          {asset.purchaseDate
                            ? new Date(asset.purchaseDate).toLocaleDateString(
                                "en-PH",
                              )
                            : "-"}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800  text-slate-500  px-4 py-3 text-xs font-medium px-4 py-3"
                          style={{ left: leftOffsets[3], width: stickyCols[3] }}
                        >
                          {asset.lifeSpan}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 font-medium text-xs text-slate-800 "
                          style={{ left: leftOffsets[4], width: stickyCols[4] }}
                        >
                          {formatMoney(asset.assetCost)}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-right text-indigo-600 font-semibold text-xs"
                          style={{ left: leftOffsets[5], width: stickyCols[5] }}
                        >
                          {formatMoney(beginningNBV)}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-right text-blue-600 font-semibold text-xs"
                          style={{ left: leftOffsets[6], width: stickyCols[6] }}
                        >
                          {formatMoney(endingNBV)}
                        </td>
                        {deps.map((d, i) => (
                          <td
                            key={i}
                            className="px-2 py-3 text-center text-slate-600 text-xs"
                          >
                            {d > 0 ? formatMoney(d) : "-"}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right font-bold text-green-500 text-xs">
                          {formatMoney(periodTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-slate-100 w-fu dark:bg-slate-700 font-bold">
                    <td colSpan={5} className="px-4 py-3 text-right">
                      Total Accumulated Depr.
                    </td>
                    <td
                      colSpan={
                        showFullLife ? timeline.length : headerMonths.length + 2
                      }
                    ></td>

                    <td className="px-4 py-3 text-right text-xs text-green-500">
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
