// OCSIQuarterlyReportButton.jsx
//
// Drop-in "Generate Report" button that reads the same asset data already
// fetched by the parent dashboard and produces a Quarterly Depreciation
// Report Excel file identical in layout to the MARCH 2026 (2) sheet.
//
// Props
// ─────
// assets        – raw asset array from the API (same shape used by the dashboard)
// selectedYear  – number, e.g. 2026
// selectedQuarter – "1" | "2" | "3" | "4"   (not "ALL")
// selectedCategory – "ALL" | category string (optional filter)
//
// Usage (inside the dashboard's filter bar, next to the existing export button):
//   <OCSIQuarterlyReportButton
//     assets={assets}
//     selectedYear={selectedYear}
//     selectedQuarter={selectedQuarter}
//     selectedCategory={selectedCategory}
//   />

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getMonthlySchedule,
  quarterMap,
  months,
} from "../../../../helpers/OCSIdepreciationHelper";

// ── helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_MAP = {
  "Office Equipment": "Office Equipments",
  "Office Equipments": "Office Equipments",
  "Rental Equipment": "Rental Equipments",
  "Rental Equipments": "Rental Equipments",
  Tools: "Tools Assets",
  "Tools Assets": "Tools Assets",
};

// Normalise the category string from the asset to one of the 3 report buckets
const getBucket = (category) => {
  if (!category) return null;
  const cat = category.trim();
  return (
    CATEGORY_MAP[cat] ||
    (cat.toLowerCase().includes("rental")
      ? "Rental Equipments"
      : cat.toLowerCase().includes("tool")
        ? "Tools Assets"
        : cat.toLowerCase().includes("office")
          ? "Office Equipments"
          : null)
  );
};

// Sum all depreciation entries that fall strictly BEFORE a given (year, month)
// boundary. month is 0-based.
const accumBefore = (schedule, year, month) => {
  let acc = 0;
  schedule.forEach((s) => {
    if (s.year < year || (s.year === year && s.month < month)) acc += s.dep;
  });
  return acc;
};

// Sum all depreciation entries for a given calendar month of a given year
const depForMonth = (schedule, year, month) => {
  const e = schedule.find((s) => s.year === year && s.month === month);
  return e ? e.dep : 0;
};

// Quarter definitions (calendar-year months, 0-based)
const QUARTER_CONFIG = {
  1: {
    months: [0, 1, 2],
    endLabel: "03/31",
    prevEndLabel: "12/31",
    prevEndDisplay: "DECEMBER 31",
  },
  2: {
    months: [3, 4, 5],
    endLabel: "06/30",
    prevEndLabel: "03/31",
    prevEndDisplay: "MARCH 31",
  },
  3: {
    months: [6, 7, 8],
    endLabel: "09/30",
    prevEndLabel: "06/30",
    prevEndDisplay: "JUNE 30",
  },
  4: {
    months: [9, 10, 11],
    endLabel: "12/31",
    prevEndLabel: "09/30",
    prevEndDisplay: "SEPTEMBER 30",
  },
};

// ── main component ────────────────────────────────────────────────────────────

const OCSIQuarterlyReportButton = ({
  assets = [],
  selectedYear,
  selectedQuarter,
  selectedCategory = "ALL",
}) => {
  const [loading, setLoading] = useState(false);

  const canGenerate =
    selectedQuarter && selectedQuarter !== "ALL" && selectedYear;

  const generateReport = async () => {
    if (!canGenerate) return;
    setLoading(true);

    try {
      const qStr = String(selectedQuarter);
      const qCfg = QUARTER_CONFIG[qStr];
      if (!qCfg) return;

      const year = Number(selectedYear);
      const prevYear = qStr === "1" ? year - 1 : year;

      // ── 1. Filter assets by category ────────────────────────────────────
      const filtered = assets.filter((a) => {
        if (!a.purchaseDate || !a.assetCost || !a.lifeSpan) return false;
        if (selectedCategory !== "ALL") {
          return (a.category || "").trim() === selectedCategory.trim();
        }
        return true;
      });

      // ── 2. Aggregate into 3 buckets ─────────────────────────────────────
      const BUCKETS = [
        "Office Equipments",
        "Tools Assets",
        "Rental Equipments",
      ];

      const zero = () => ({
        lifetimeCostBeg: 0,
        additions: 0,
        accumDepBeg: 0,
        dep: [0, 0, 0], // 3 monthly values for the quarter
      });

      const buckets = {
        "Office Equipments": zero(),
        "Tools Assets": zero(),
        "Rental Equipments": zero(),
      };

      filtered.forEach((asset) => {
        const bucket = getBucket(asset.category);
        if (!bucket) return;
        const b = buckets[bucket];

        const cost = Number(asset.assetCost) || 0;
        const schedule = getMonthlySchedule(asset);

        // Lifetime cost balance as of end of prior quarter
        // = asset cost if it was purchased on or before the last day of prev quarter
        const purchaseDate = new Date(asset.purchaseDate);
        const firstQMonth = qCfg.months[0]; // 0-based month of Q start
        // Asset exists at beginning of this quarter if purchased before Q start
        const purchasedBeforeQStart =
          purchaseDate.getFullYear() < year ||
          (purchaseDate.getFullYear() === year &&
            purchaseDate.getMonth() < firstQMonth);

        // Additions: purchased during this quarter
        const lastQMonth = qCfg.months[2];
        const purchasedInQuarter =
          purchaseDate.getFullYear() === year &&
          purchaseDate.getMonth() >= firstQMonth &&
          purchaseDate.getMonth() <= lastQMonth;

        if (purchasedBeforeQStart) {
          b.lifetimeCostBeg += cost;
        }
        if (purchasedInQuarter) {
          b.additions += cost;
        }

        // Accumulated depreciation as of end of prior quarter
        // = sum of all dep entries before the first month of this quarter
        const accumAtQStart = accumBefore(schedule, year, firstQMonth);
        // Clamp to cost
        b.accumDepBeg += Math.min(accumAtQStart, cost);

        // Monthly depreciation for each month of the quarter
        qCfg.months.forEach((m, i) => {
          b.dep[i] += depForMonth(schedule, year, m);
        });
      });

      // ── 3. Compute derived values ────────────────────────────────────────
      const total = (field) =>
        BUCKETS.reduce((s, bk) => s + buckets[bk][field], 0);

      const totalDepArr = [0, 0, 0].map((_, i) =>
        BUCKETS.reduce((s, bk) => s + buckets[bk].dep[i], 0),
      );

      const lifetimeCostEnd = (bk) =>
        buckets[bk].lifetimeCostBeg + buckets[bk].additions;

      const accumDepEnd = (bk) =>
        buckets[bk].accumDepBeg +
        buckets[bk].dep[0] +
        buckets[bk].dep[1] +
        buckets[bk].dep[2];

      const nbv = (bk) => lifetimeCostEnd(bk) - accumDepEnd(bk);

      // ── 4. Build Excel workbook ──────────────────────────────────────────
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(`Q${qStr} ${year}`);

      // ── column widths ───────────────────────────────────────────────────
      ws.columns = [
        { width: 60 }, // A – labels
        { width: 18 }, // B – Office
        { width: 14 }, // C – Tools
        { width: 18 }, // D – Rental
        { width: 18 }, // E – TOTAL
      ];

      // ── style helpers ───────────────────────────────────────────────────
      const MONEY = "#,##0.00";
      const right = { horizontal: "right" };
      const center = { horizontal: "center" };
      const HEADER_FILL = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" },
      };
      const TOTAL_FILL = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE2EFDA" },
      };
      const NBV_FILL = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDCE6F1" },
      };
      const THIN_BORDER = { style: "thin", color: { argb: "FFB8CCE4" } };
      const THICK_BORDER = { style: "medium", color: { argb: "FF2F75B6" } };

      const applyBorder = (row, bottom = THIN_BORDER) => {
        row.eachCell({ includeEmpty: true }, (cell, col) => {
          if (col >= 2 && col <= 5) {
            cell.border = {
              top: cell.border?.top,
              bottom,
              left: col === 2 ? THIN_BORDER : undefined,
              right: col === 5 ? THIN_BORDER : undefined,
            };
          }
        });
      };

      const moneyCell = (row, col, value, fill) => {
        const cell = row.getCell(col);
        cell.value = value;
        cell.numFmt = MONEY;
        cell.alignment = right;
        if (fill) cell.fill = fill;
      };

      const labelCell = (row, text, indent = 0, bold = false) => {
        const cell = row.getCell(1);
        cell.value = "  ".repeat(indent) + text;
        cell.font = { bold, name: "Calibri", size: 10 };
      };

      // ── month labels for this quarter ───────────────────────────────────
      const qMonthLabels = qCfg.months.map((m) => {
        const lastDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const d = lastDays[m];
        return `${String(m + 1).padStart(2, "0")}/${d}/${year}`;
      });

      // ── quarter date strings ────────────────────────────────────────────
      const prevEndStr = `${qCfg.prevEndLabel}/${prevYear}`;
      const curEndStr = `${qCfg.endLabel}/${year}`;

      // ── ROW 1 – Title ───────────────────────────────────────────────────
      const r1 = ws.addRow([
        `OCSI Qtrly_ CY-${year} EQUIPMENT ASSETS GROSS DEPRECIATION`,
      ]);
      r1.getCell(1).font = { bold: true, size: 13, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, 5);
      r1.getCell(1).alignment = center;

      // ── ROW 2 – As of ───────────────────────────────────────────────────
      const asOfMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const lastM = qCfg.months[2];
      const lastDayMap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const asOfStr = `As of ${asOfMonthNames[lastM]} ${lastDayMap[lastM]}, ${year}`;

      const r2 = ws.addRow([asOfStr]);
      r2.getCell(1).font = { italic: true, size: 10, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, 5);
      r2.getCell(1).alignment = center;

      // ── ROW 3 – blank ───────────────────────────────────────────────────
      ws.addRow([]);

      // ── ROW 4-5 – Column headers ─────────────────────────────────────────
      const r4 = ws.addRow(["", "Office", "Tools", "Rental", "TOTAL"]);
      const r5 = ws.addRow(["", "Equipments", "Assets", "Equipments", ""]);
      [r4, r5].forEach((r) => {
        r.eachCell({ includeEmpty: true }, (cell, col) => {
          if (col >= 2) {
            cell.font = { bold: true, size: 10, name: "Calibri" };
            cell.alignment = center;
            cell.fill = HEADER_FILL;
            cell.border = {
              top: THIN_BORDER,
              bottom: THIN_BORDER,
              left: THIN_BORDER,
              right: THIN_BORDER,
            };
          }
        });
      });

      // ── ROW 6 – blank ───────────────────────────────────────────────────
      ws.addRow([]);

      // ── SECTION: COST ────────────────────────────────────────────────────
      const rCostHdr = ws.addRow(["   Cost"]);
      rCostHdr.getCell(1).font = { bold: true, size: 10, name: "Calibri" };

      // Life Time balance as of prior period end
      const rCostBeg = ws.addRow([]);
      labelCell(rCostBeg, `Life Time balance as of ${prevEndStr}`, 2);
      BUCKETS.forEach((bk, i) =>
        moneyCell(rCostBeg, i + 2, buckets[bk].lifetimeCostBeg),
      );
      moneyCell(
        rCostBeg,
        5,
        BUCKETS.reduce((s, bk) => s + buckets[bk].lifetimeCostBeg, 0),
      );

      // Additions
      const rAdd = ws.addRow([]);
      labelCell(rAdd, "Additions", 2);
      BUCKETS.forEach((bk, i) => moneyCell(rAdd, i + 2, buckets[bk].additions));
      moneyCell(rAdd, 5, total("additions"));

      // blank
      ws.addRow([]);

      // Lifetime cost Balance
      const rCostEnd = ws.addRow([]);
      labelCell(rCostEnd, `Lifetime cost Balance as of ${curEndStr}`, 0, true);
      BUCKETS.forEach((bk, i) =>
        moneyCell(rCostEnd, i + 2, lifetimeCostEnd(bk), TOTAL_FILL),
      );
      moneyCell(
        rCostEnd,
        5,
        BUCKETS.reduce((s, bk) => s + lifetimeCostEnd(bk), 0),
        TOTAL_FILL,
      );
      rCostEnd.eachCell({ includeEmpty: true }, (cell, col) => {
        if (col >= 2 && col <= 5) {
          cell.border = { top: THICK_BORDER, bottom: THICK_BORDER };
          cell.font = { bold: true, size: 10, name: "Calibri" };
        }
      });

      // blank
      ws.addRow([]);

      // ── SECTION: ACCUMULATED DEPRECIATION ───────────────────────────────
      const rAccHdr = ws.addRow(["   Accumulated Depreciation"]);
      rAccHdr.getCell(1).font = { bold: true, size: 10, name: "Calibri" };

      // Beginning balance
      const rAccBeg = ws.addRow([]);
      labelCell(
        rAccBeg,
        `Lifetime accumulated depreciation as of  ${prevEndStr}`,
        2,
      );
      BUCKETS.forEach((bk, i) =>
        moneyCell(rAccBeg, i + 2, buckets[bk].accumDepBeg),
      );
      moneyCell(rAccBeg, 5, total("accumDepBeg"));

      // 3 monthly depreciation rows
      const rDeps = [];
      qCfg.months.forEach((m, i) => {
        const rDep = ws.addRow([]);
        labelCell(rDep, `Depreciation ${qMonthLabels[i]}`, 2);
        BUCKETS.forEach((bk, bi) =>
          moneyCell(rDep, bi + 2, buckets[bk].dep[i]),
        );
        moneyCell(rDep, 5, totalDepArr[i]);
        rDeps.push(rDep);
      });

      // Depreciation Balance (accumulated depr end)
      const rAccEnd = ws.addRow([]);
      labelCell(rAccEnd, `Depreciation Balance of ${curEndStr}`, 0, true);
      BUCKETS.forEach((bk, i) =>
        moneyCell(rAccEnd, i + 2, accumDepEnd(bk), TOTAL_FILL),
      );
      moneyCell(
        rAccEnd,
        5,
        BUCKETS.reduce((s, bk) => s + accumDepEnd(bk), 0),
        TOTAL_FILL,
      );
      rAccEnd.eachCell({ includeEmpty: true }, (cell, col) => {
        if (col >= 2 && col <= 5) {
          cell.border = { top: THICK_BORDER, bottom: THICK_BORDER };
          cell.font = { bold: true, size: 10, name: "Calibri" };
        }
      });

      // blank
      ws.addRow([]);

      // ── NET BOOK VALUE row ───────────────────────────────────────────────
      const rNBV = ws.addRow([]);
      labelCell(rNBV, `NET BOOK VALUE as of ${curEndStr}`, 0, true);
      BUCKETS.forEach((bk, i) => {
        const cell = rNBV.getCell(i + 2);
        cell.value = nbv(bk);
        cell.numFmt = MONEY;
        cell.alignment = right;
        cell.fill = NBV_FILL;
        cell.font = {
          bold: true,
          size: 10,
          name: "Calibri",
          color: { argb: "FF1F3864" },
        };
        cell.border = { top: THICK_BORDER, bottom: THICK_BORDER };
      });
      const totalNBV = BUCKETS.reduce((s, bk) => s + nbv(bk), 0);
      const nbvTotalCell = rNBV.getCell(5);
      nbvTotalCell.value = totalNBV;
      nbvTotalCell.numFmt = MONEY;
      nbvTotalCell.alignment = right;
      nbvTotalCell.fill = NBV_FILL;
      nbvTotalCell.font = {
        bold: true,
        size: 11,
        name: "Calibri",
        color: { argb: "FF1F3864" },
      };
      nbvTotalCell.border = { top: THICK_BORDER, bottom: THICK_BORDER };

      // blank
      ws.addRow([]);

      // ── Footnote & Prepared By ───────────────────────────────────────────
      const rNote = ws.addRow([
        "*Understated Rental Equipments Purchased Costs from Previous FS",
      ]);
      rNote.getCell(1).font = {
        italic: true,
        size: 9,
        name: "Calibri",
        color: { argb: "FF666666" },
      };
      ws.addRow([]);
      const rPrep = ws.addRow(["   PREPARED BY:"]);
      rPrep.getCell(1).font = { bold: true, size: 10, name: "Calibri" };

      // ── freeze top rows ──────────────────────────────────────────────────
      ws.views = [{ state: "frozen", xSplit: 0, ySplit: 5 }];

      // ── print area / page setup ──────────────────────────────────────────
      ws.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
      };

      // ── write & download ─────────────────────────────────────────────────
      const buffer = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        `OCSI_Qtrly_Q${qStr}_${year}.xlsx`,
      );
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Quarter → readable "as of" label for the button tooltip
  const asOfLabel = (() => {
    if (!canGenerate) return "";
    const ends = { 1: `Mar 31`, 2: `Jun 30`, 3: `Sep 30`, 4: `Dec 31` };
    return `Report as of ${ends[String(selectedQuarter)]} ${selectedYear}`;
  })();

  return (
    <button
      onClick={generateReport}
      disabled={!canGenerate || loading}
      title={asOfLabel || "Select a specific quarter to generate report"}
      className={[
        "flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-semibold transition",
        canGenerate && !loading
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400",
      ].join(" ")}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          Generating…
        </>
      ) : (
        <>
          {/* document + down-arrow icon */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          {asOfLabel || "Generate Report"}
        </>
      )}
    </button>
  );
};

export default OCSIQuarterlyReportButton;
