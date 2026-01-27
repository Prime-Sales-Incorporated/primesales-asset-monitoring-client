import React, { useEffect, useState } from "react";
import Header from "../components/header";
import API_BASE_URL from "../../API";
import * as XLSX from "xlsx";
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

// ===== Depreciation Helpers =====
const getMonthlySchedule = (asset) => {
  const cost = Number(asset.assetCost) || 0;
  const life = Number(asset.lifeSpan) || 1;
  if (!asset.purchaseDate || cost <= 0 || life <= 0) return [];

  const purchase = new Date(asset.purchaseDate);
  if (isNaN(purchase)) return [];

  const standardMonthly = cost / (life * 12);
  const dailyRate = standardMonthly / 30;

  let schedule = [];
  let accumulated = 0;
  let month = purchase.getMonth();
  let year = purchase.getFullYear();

  const firstMonthDep = Number(
    (dailyRate * (30 - purchase.getDate() + 1)).toFixed(2),
  );

  schedule.push({ year, month, dep: firstMonthDep });
  accumulated += firstMonthDep;

  while (accumulated + standardMonthly < cost) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    schedule.push({ year, month, dep: Number(standardMonthly.toFixed(2)) });
    accumulated += standardMonthly;
  }

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

// ✅ Generate complete timeline from earliest to latest depreciation
const getCompleteTimeline = (assets) => {
  if (!assets || assets.length === 0) return [];

  let earliestYear = new Date().getFullYear();
  let earliestMonth = new Date().getMonth();
  let latestYear = new Date().getFullYear();
  let latestMonth = new Date().getMonth();

  assets.forEach((asset) => {
    const schedule = getMonthlySchedule(asset);
    if (schedule.length > 0) {
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
  let currentYear = earliestYear;
  let currentMonth = earliestMonth;

  while (
    currentYear < latestYear ||
    (currentYear === latestYear && currentMonth <= latestMonth)
  ) {
    timeline.push({
      year: currentYear,
      month: currentMonth,
      label: `${months[currentMonth]} ${currentYear}`,
    });

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return timeline;
};

const AssetDepreciationDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxFiscalYear, setMaxFiscalYear] = useState(new Date().getFullYear());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    new Date().getFullYear(),
  );
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // ✅ NEW - Full Lifespan toggle
  const [showFullLife, setShowFullLife] = useState(false);

  const formatMoney = (v) =>
    new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

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
            const lastMonth = schedule[schedule.length - 1];
            lastYear = Math.max(
              lastYear,
              getFiscalYearLabel(lastMonth.year, lastMonth.month),
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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Depreciation");
    sheet.views = [
      {
        state: "frozen",
        xSplit: 5, // freeze first 5 columns (Particulars → Cost)
        ySplit: 3, // freeze title + fiscal + header rows (optional but recommended)
      },
    ];

    // ✅ Use timeline for full life or regular months
    let headerLabels = [];
    if (showFullLife) {
      const timeline = getCompleteTimeline(filteredAssets);
      headerLabels = timeline.map((t) => t.label);
    } else {
      const headerMonths =
        selectedQuarter === "ALL" ? fiscalMonths : quarterMap[selectedQuarter];
      headerLabels = headerMonths.map((m) => months[m]);
    }

    const totalColumns = 5 + headerLabels.length + 1;

    const titleRow = sheet.addRow(["Asset Depreciation Report"]);
    titleRow.font = { bold: true, size: 16 };
    sheet.mergeCells(1, 1, 1, totalColumns);
    titleRow.alignment = { horizontal: "center" };

    const fiscalRow = sheet.addRow([
      showFullLife
        ? "Full Lifespan View"
        : `Fiscal Year: ${selectedFiscalYear}-${selectedFiscalYear + 1} ${
            selectedQuarter !== "ALL"
              ? `– Quarter: Q${selectedQuarter}`
              : "(Full Fiscal Year)"
          }`,
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
        const timeline = getCompleteTimeline(filteredAssets);
        deps = timeline.map((t) => {
          const entry = schedule.find(
            (s) => s.year === t.year && s.month === t.month,
          );
          return entry ? entry.dep : 0;
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
        const timeline = getCompleteTimeline(filteredAssets);
        deps = timeline.map((t) => {
          const entry = schedule.find(
            (s) => s.year === t.year && s.month === t.month,
          );
          return entry ? entry.dep : 0;
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
      if (!column.width || column.width < 11) {
        column.width = 11;
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer]),
      showFullLife
        ? `AssetDepreciation_FullLifespan.xlsx`
        : `AssetDepreciation_${selectedFiscalYear}_${selectedQuarter}.xlsx`,
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading assets...
      </div>
    );

  let totalPeriodDep = 0;

  // ✅ Use timeline for full life or regular months
  const timeline = showFullLife ? getCompleteTimeline(filteredAssets) : null;
  const headerMonths = showFullLife
    ? null
    : selectedQuarter === "ALL"
      ? fiscalMonths
      : quarterMap[selectedQuarter];

  return (
    <div className="min-h-screen bg-background-light w-scree dark:bg-background-dark dark:text-gray-300">
      <main className="px-3 py-4">
        <h1 className="text-lg font-bold mb-3">Asset Depreciation</h1>

        <div className="flex gap-4 mb-3 text-sm flex-wrap">
          <div>
            <label className="mr-1 font-semibold">Fiscal Year:</label>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
              className="border px-2 py-1"
              disabled={showFullLife}
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
            <label className="mr-1 font-semibold">Period:</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border px-2 py-1"
              disabled={showFullLife}
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
            <label className="mr-1 font-semibold">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border px-2 py-1"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ NEW - Full Lifespan Checkbox */}
          <label className="flex items-center gap-1 font-semibold">
            <input
              type="checkbox"
              checked={showFullLife}
              onChange={(e) => setShowFullLife(e.target.checked)}
            />
            Full Lifespan
          </label>

          <button
            onClick={exportToExcel}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>

        <div className="overflow-x-scroll w-full px-4">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-black/10">
                <th colSpan={5}></th>
                <th
                  colSpan={
                    showFullLife ? timeline?.length || 0 : headerMonths.length
                  }
                  className="border bg-yellow-300 text-center"
                >
                  {showFullLife
                    ? "Full Lifespan View"
                    : `Fiscal Year ${selectedFiscalYear}-${
                        selectedFiscalYear + 1
                      }${
                        selectedQuarter !== "ALL"
                          ? ` – Q${selectedQuarter}`
                          : ""
                      }`}
                </th>
                <th className="border">Total</th>
              </tr>
              <tr>
                {["Particulars", "Class", "Date", "Life", "Cost"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="sticky bg-white outline outline-1 p-1"
                      style={{ left: `${i * 0}px`, zIndex: 30 }} // added left & z-index
                    >
                      {h}
                    </th>
                  ),
                )}

                {showFullLife
                  ? timeline?.map((t, i) => (
                      <th key={i} className="border p-1 w-[70px]">
                        {t.label}
                      </th>
                    ))
                  : headerMonths.map((m) => (
                      <th key={m} className="border p-1 w-[70px]">
                        {months[m]}
                      </th>
                    ))}

                <th className="border p-1">-</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.map((asset) => {
                const schedule = getMonthlySchedule(asset);

                let deps = [];
                if (showFullLife) {
                  deps = timeline.map((t) => {
                    const entry = schedule.find(
                      (s) => s.year === t.year && s.month === t.month,
                    );
                    return entry ? entry.dep : 0;
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
                totalPeriodDep += periodTotal;

                return (
                  <tr key={asset._id}>
                    <td
                      className="bg-white outline outline-1 p-1"
                      style={{ left: "0px", zIndex: 20, position: "sticky" }}
                    >
                      {asset.assetName}
                    </td>
                    <td
                      className="bg-white outline outline-1 p-1"
                      style={{ left: "60px", zIndex: 20, position: "sticky" }}
                    >
                      {asset.category}
                    </td>
                    <td
                      className="bg-white outline outline-1 p-1"
                      style={{ left: "120px", zIndex: 20, position: "sticky" }}
                    >
                      {asset.purchaseDate
                        ? new Date(asset.purchaseDate).toLocaleDateString(
                            "en-PH",
                          )
                        : "-"}
                    </td>
                    <td
                      className="bg-white outline outline-1 p-1 text-center"
                      style={{ left: "200", zIndex: 20, position: "sticky" }}
                    >
                      {asset.lifeSpan}
                    </td>
                    <td
                      className="bg-white outline outline-1 p-1"
                      style={{ left: "320", zIndex: 20, position: "sticky" }}
                    >
                      ₱{formatMoney(asset.assetCost)}
                    </td>

                    {deps.map((dep, i) => (
                      <td key={i} className="border p-1 text-right">
                        {dep > 0 ? `₱${formatMoney(dep)}` : "-"}
                      </td>
                    ))}

                    <td className="border p-1 text-right font-semibold">
                      ₱{formatMoney(periodTotal)}
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-black/10 font-bold">
                <td colSpan={5} className="text-right p-1">
                  TOTAL
                </td>
                <td
                  colSpan={
                    showFullLife ? timeline?.length || 0 : headerMonths.length
                  }
                ></td>
                <td className="border p-1 text-right">
                  ₱{formatMoney(totalPeriodDep)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AssetDepreciationDashboard;
