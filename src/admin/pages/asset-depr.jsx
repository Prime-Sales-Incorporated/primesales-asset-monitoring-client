// AssetDepreciationDashboard.jsx
// UI upgraded to match provided Tailwind dashboard table layout
// Logic & functionality preserved

import React, { useEffect, useState } from "react";
import Header from "../components/header";
import API_BASE_URL from "../../API";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const quarterMap = {
  1: [5, 6, 7],
  2: [8, 9, 10],
  3: [11, 0, 1],
  4: [2, 3, 4],
};

const fiscalMonths = [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];

// ================= Helpers =================
const getMonthlySchedule = (asset) => {
  const cost = Number(asset.assetCost) || 0;
  const life = Number(asset.lifeSpan) || 1; // NOW months

  if (!asset.purchaseDate || cost <= 0 || life <= 0) return [];

  const purchase = new Date(asset.purchaseDate);
  if (isNaN(purchase)) return [];

  const standardMonthly = cost / life; // ✅ months logic
  const dailyRate = standardMonthly / 30;

  let schedule = [];
  let accumulated = 0;
  let month = purchase.getMonth();
  let year = purchase.getFullYear();

  // First partial month
  const firstMonthDep = Number(
    (dailyRate * (30 - purchase.getDate() + 1)).toFixed(2),
  );

  schedule.push({ year, month, dep: firstMonthDep });
  accumulated += firstMonthDep;

  // Full months
  while (accumulated + standardMonthly < cost) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }

    schedule.push({
      year,
      month,
      dep: Number(standardMonthly.toFixed(2)),
    });

    accumulated += standardMonthly;
  }

  // Last remainder
  const remaining = Number((cost - accumulated).toFixed(2));
  if (remaining > 0) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    schedule.push({ year, month, dep: remaining });
  }

  return schedule;
};

const getFiscalYearLabel = (year, month, fiscalStartMonth = 5) =>
  month >= fiscalStartMonth ? year : year - 1;

const getScheduleForQuarter = (schedule, fiscalYear, quarter) => {
  const qMonths = quarterMap[quarter];
  return qMonths.map((m) => {
    const entry = schedule.find(
      (s) =>
        getFiscalYearLabel(s.year, s.month) === fiscalYear && s.month === m,
    );
    return entry ? entry.dep : 0;
  });
};

const getScheduleForFiscalYear = (schedule, fiscalYear) =>
  fiscalMonths.map((m) => {
    const entry = schedule.find(
      (s) =>
        getFiscalYearLabel(s.year, s.month) === fiscalYear && s.month === m,
    );
    return entry ? entry.dep : 0;
  });

const getCompleteTimeline = (assets) => {
  if (!assets || assets.length === 0) return [];

  let earliestYear = new Date().getFullYear();
  let earliestMonth = new Date().getMonth();
  let latestYear = earliestYear;
  let latestMonth = earliestMonth;

  assets.forEach((asset) => {
    const schedule = getMonthlySchedule(asset);
    if (schedule.length) {
      const first = schedule[0];
      const last = schedule[schedule.length - 1];

      if (
        first.year < earliestYear ||
        (first.year === earliestYear && first.month < earliestMonth)
      ) {
        earliestYear = first.year;
        earliestMonth = first.month;
      }

      if (
        last.year > latestYear ||
        (last.year === latestYear && last.month > latestMonth)
      ) {
        latestYear = last.year;
        latestMonth = last.month;
      }
    }
  });

  const timeline = [];
  let y = earliestYear;
  let m = earliestMonth;

  while (y < latestYear || (y === latestYear && m <= latestMonth)) {
    timeline.push({ year: y, month: m, label: `${months[m]} ${y}` });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  return timeline;
};
const stickyCols = [120, 120, 120, 100, 120];

// ================= Component =================
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

  // Define widths including padding if needed
  const stickyCols = [118, 80, 97, 57, 120]; // px
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
            lastYear = Math.max(
              lastYear,
              getFiscalYearLabel(last.year, last.month),
            );
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
  const filteredAssets =
    selectedCategory === "ALL"
      ? assets
      : assets.filter((a) => a.category === selectedCategory);

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

    sheet.views = [
      {
        state: "frozen",
        xSplit: 5, // freeze first 5 columns
        ySplit: 3, // freeze title + fiscal + header
      },
    ];

    // Prepare headers
    let headerLabels = [];
    if (showFullLife) {
      const tl = getCompleteTimeline(filteredAssets);
      headerLabels = tl.map((t) => t.label);
    } else {
      const hm =
        selectedQuarter === "ALL" ? fiscalMonths : quarterMap[selectedQuarter];
      headerLabels = hm.map((m) => months[m]);
    }

    const totalColumns = 5 + headerLabels.length + 1;

    const titleRow = sheet.addRow(["Asset Depreciation Report"]);
    titleRow.font = { bold: true, size: 16 };
    sheet.mergeCells(1, 1, 1, totalColumns);
    titleRow.alignment = { horizontal: "center" };

    const fiscalRow = sheet.addRow([
      showFullLife
        ? "Full Lifespan View"
        : `Fiscal Year: ${selectedFiscalYear}-${selectedFiscalYear + 1} ${selectedQuarter !== "ALL" ? `– Quarter: Q${selectedQuarter}` : "(Full Fiscal Year)"}`,
    ]);
    fiscalRow.font = { bold: true };
    sheet.mergeCells(2, 1, 2, totalColumns);
    fiscalRow.alignment = { horizontal: "center" };
    fiscalRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
    });

    const headers = [
      "Particulars",
      "Class",
      "Date",
      "Life",
      "Cost",
      ...headerLabels,
      "Total",
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    filteredAssets.forEach((asset) => {
      const schedule = getMonthlySchedule(asset);
      let deps = [];
      if (showFullLife) {
        const tl = getCompleteTimeline(filteredAssets);
        deps = tl.map((t) => {
          const e = schedule.find(
            (s) => s.year === t.year && s.month === t.month,
          );
          return e ? e.dep : 0;
        });
      } else {
        deps =
          selectedQuarter === "ALL"
            ? getScheduleForFiscalYear(schedule, selectedFiscalYear)
            : getScheduleForQuarter(
                schedule,
                selectedFiscalYear,
                Number(selectedQuarter),
              );
      }
      const periodTotal = deps.reduce((a, b) => a + b, 0);
      const row = sheet.addRow([
        asset.assetName,
        asset.category,
        asset.purchaseDate
          ? new Date(asset.purchaseDate).toLocaleDateString("en-PH")
          : "-",
        asset.lifeSpan,
        asset.assetCost,
        ...deps,
        periodTotal,
      ]);
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (
          [5, ...headerLabels.map((_, i) => 6 + i), totalColumns].includes(
            colNumber,
          )
        ) {
          cell.numFmt = "₱#,##0.00";
          cell.alignment = { horizontal: "right" };
        }
      });
    });

    const totalDeps = filteredAssets.reduce((sum, asset) => {
      const schedule = getMonthlySchedule(asset);
      let deps = [];
      if (showFullLife) {
        const tl = getCompleteTimeline(filteredAssets);
        deps = tl.map((t) => {
          const e = schedule.find(
            (s) => s.year === t.year && s.month === t.month,
          );
          return e ? e.dep : 0;
        });
      } else {
        deps =
          selectedQuarter === "ALL"
            ? getScheduleForFiscalYear(schedule, selectedFiscalYear)
            : getScheduleForQuarter(
                schedule,
                selectedFiscalYear,
                Number(selectedQuarter),
              );
      }
      return sum + deps.reduce((a, b) => a + b, 0);
    }, 0);

    const totalRow = sheet.addRow([
      "TOTAL",
      "",
      "",
      "",
      "",
      ...Array(headerLabels.length).fill(""),
      totalDeps,
    ]);
    totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      cell.font = { bold: true };
      cell.alignment = { horizontal: colNumber === 1 ? "left" : "right" };
      if ([6 + headerLabels.length].includes(colNumber))
        cell.numFmt = "₱#,##0.00";
    });

    const moneyCols = [5, ...headerLabels.map((_, i) => 6 + i), totalColumns];
    moneyCols.forEach((col) => {
      const column = sheet.getColumn(col);
      if (!column.width || column.width < 11) column.width = 11;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      showFullLife
        ? "AssetDepreciation_FullLifespan.xlsx"
        : `AssetDepreciation_${selectedFiscalYear}_${selectedQuarter}.xlsx`,
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading assets...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:text-slate-100">
      <div className="mx-auto w-[1366px] max-w-full">
        <main className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4 items-end  bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700">
            <div>
              <label className="block text-sm mb-1">Fiscal Year</label>
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
              <label className="block text-sm mb-1">Period</label>
              <select
                disabled={showFullLife}
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="rounded-lg border px-2 py-1 dark:bg-slate-900"
              >
                <option value="ALL">Fiscal Year</option>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    Q{q}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Category</label>
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

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showFullLife}
                onChange={(e) => setShowFullLife(e.target.checked)}
              />
              Show Full Lifespan
            </label>

            <button
              onClick={exportToExcel}
              className="ml-auto bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              Export to Excel
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 w-full rounded-xl border dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700 text-xs uppercase tracking-wider">
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={{ left: leftOffsets[0], width: stickyCols[0] }}
                    >
                      Particulars
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={{ left: leftOffsets[1], width: stickyCols[1] }}
                    >
                      Class
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={{ left: leftOffsets[2], width: stickyCols[2] }}
                    >
                      Date
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={{ left: leftOffsets[3], width: stickyCols[3] }}
                    >
                      Life mos.
                    </th>
                    <th
                      className="sticky z-30 bg-slate-100 dark:bg-slate-700 px-4 py-3"
                      style={{ left: leftOffsets[4], width: stickyCols[4] }}
                    >
                      Cost
                    </th>

                    {(showFullLife ? timeline : headerMonths).map((m, i) => (
                      <th
                        key={i}
                        className="px-2 py-3 text-center bg-blue-50 dark:bg-blue-900/20"
                      >
                        {showFullLife ? m.label : months[m]}
                      </th>
                    ))}

                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-slate-700">
                  {filteredAssets.map((asset) => {
                    const schedule = getMonthlySchedule(asset);

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
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 font-medium"
                          style={{ left: leftOffsets[0], width: stickyCols[0] }}
                        >
                          {asset.assetName}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 text-slate-500"
                          style={{ left: leftOffsets[1], width: stickyCols[1] }}
                        >
                          {asset.category}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3"
                          style={{ left: leftOffsets[2], width: stickyCols[2] }}
                        >
                          {asset.purchaseDate
                            ? new Date(asset.purchaseDate).toLocaleDateString(
                                "en-PH",
                              )
                            : "-"}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3"
                          style={{ left: leftOffsets[3], width: stickyCols[3] }}
                        >
                          {asset.lifeSpan}
                        </td>
                        <td
                          className="sticky z-20 bg-white dark:bg-slate-800 px-4 py-3 font-medium"
                          style={{ left: leftOffsets[4], width: stickyCols[4] }}
                        >
                          ₱{formatMoney(asset.assetCost)}
                        </td>

                        {deps.map((d, i) => (
                          <td
                            key={i}
                            className="px-2 py-3 text-center text-slate-600"
                          >
                            {d > 0 ? formatMoney(d) : "-"}
                          </td>
                        ))}

                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                          ₱{formatMoney(periodTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-700 font-bold">
                    <td colSpan={5} className="px-4 py-3 text-right">
                      Total Depreciation
                    </td>
                    <td
                      colSpan={
                        showFullLife ? timeline.length : headerMonths.length
                      }
                    ></td>
                    <td className="px-4 py-3 text-right">
                      ₱{formatMoney(totalPeriodDep)}
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
