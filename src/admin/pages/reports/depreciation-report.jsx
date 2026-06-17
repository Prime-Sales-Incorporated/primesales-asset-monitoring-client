// QuarterlyReportButton.jsx
//
// Drop-in "Generate Report" button for the PrimeSales AssetDepreciationDashboard.
// Reads the same asset data already fetched by the parent and produces a
// Quarterly Depreciation Report Excel file matching the OCSI "MARCH 2026 (2)"
// layout — adapted for PrimeSales' FISCAL year (Jun–May).
//
// Fiscal Year quarters (FY starts June 1):
//   Q1 → Jun, Jul, Aug  (selectedFiscalYear)
//   Q2 → Sep, Oct, Nov  (selectedFiscalYear)
//   Q3 → Dec, Jan, Feb  (selectedFiscalYear / selectedFiscalYear+1)
//   Q4 → Mar, Apr, May  (selectedFiscalYear+1)
//
// Props
// ─────
// assets             – raw asset array from the API (same shape as dashboard)
// selectedFiscalYear – number, e.g. 2025  (means FY 2025-2026)
// selectedQuarter    – "1" | "2" | "3" | "4"  (NOT "ALL" — button disables for ALL)
// selectedCategory   – "ALL" | category string (optional filter)

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getMonthlySchedule,
  getBeginningNBV,
  getFiscalYearLabel,
  fiscalPos,
  firstPosOfQuarter,
  lastPosOfQuarter,
  quarterMap,
} from "../../../helpers/depreciationHelper";

// ── Fiscal-year quarter config ────────────────────────────────────────────────
const FY_QUARTERS = {
  1: {
    monthDefs: [
      { month: 5, yearOffset: 0 }, // Jun
      { month: 6, yearOffset: 0 }, // Jul
      { month: 7, yearOffset: 0 }, // Aug
    ],
    endLabel: (fy) => `08/31/${fy}`,
    endDisplay: (fy) => `August 31, ${fy}`,
    prevEndLabel: (fy) => `05/31/${fy}`,
    prevEndDisplay: (fy) => `May 31, ${fy}`,
    sheetName: (fy) => `Q1 FY${fy}-${fy + 1}`,
    fileName: (fy) => `PrimeSales_Qtrly_Q1_FY${fy}-${fy + 1}.xlsx`,
    buttonLabel: (fy) => `Report as of Aug 31, ${fy}`,
  },
  2: {
    monthDefs: [
      { month: 8, yearOffset: 0 }, // Sep
      { month: 9, yearOffset: 0 }, // Oct
      { month: 10, yearOffset: 0 }, // Nov
    ],
    endLabel: (fy) => `11/30/${fy}`,
    endDisplay: (fy) => `November 30, ${fy}`,
    prevEndLabel: (fy) => `08/31/${fy}`,
    prevEndDisplay: (fy) => `August 31, ${fy}`,
    sheetName: (fy) => `Q2 FY${fy}-${fy + 1}`,
    fileName: (fy) => `PrimeSales_Qtrly_Q2_FY${fy}-${fy + 1}.xlsx`,
    buttonLabel: (fy) => `Report as of Nov 30, ${fy}`,
  },
  3: {
    monthDefs: [
      { month: 11, yearOffset: 0 }, // Dec
      { month: 0, yearOffset: 1 }, // Jan (next CY)
      { month: 1, yearOffset: 1 }, // Feb (next CY)
    ],
    endLabel: (fy) => `02/28/${fy + 1}`,
    endDisplay: (fy) => `February 28, ${fy + 1}`,
    prevEndLabel: (fy) => `11/30/${fy}`,
    prevEndDisplay: (fy) => `November 30, ${fy}`,
    sheetName: (fy) => `Q3 FY${fy}-${fy + 1}`,
    fileName: (fy) => `PrimeSales_Qtrly_Q3_FY${fy}-${fy + 1}.xlsx`,
    buttonLabel: (fy) => `Report as of Feb 28, ${fy + 1}`,
  },
  4: {
    monthDefs: [
      { month: 2, yearOffset: 1 }, // Mar (next CY)
      { month: 3, yearOffset: 1 }, // Apr
      { month: 4, yearOffset: 1 }, // May
    ],
    endLabel: (fy) => `05/31/${fy + 1}`,
    endDisplay: (fy) => `May 31, ${fy + 1}`,
    prevEndLabel: (fy) => `02/28/${fy + 1}`,
    prevEndDisplay: (fy) => `February 28, ${fy + 1}`,
    sheetName: (fy) => `Q4 FY${fy}-${fy + 1}`,
    fileName: (fy) => `PrimeSales_Qtrly_Q4_FY${fy}-${fy + 1}.xlsx`,
    buttonLabel: (fy) => `Report as of May 31, ${fy + 1}`,
  },
};

// ── Category bucket mapping ───────────────────────────────────────────────────
// IMPORTANT: The three report buckets must cover every category that exists in
// the database.  Any category that doesn't match "rental" or "tool" falls into
// "Office Equipments" — the same bucket the dashboard would show it under.
// This guarantees report totals always equal dashboard totals.
const BUCKET_LABELS = [
  "Office Equipments",
  "Tools Assets",
  "Rental Equipments",
];

const getBucket = (category) => {
  if (!category) return "Office Equipments"; // default fallback
  const c = category.trim().toLowerCase();
  if (c.includes("rental")) return "Rental Equipments";
  if (c.includes("tool")) return "Tools Assets";
  // Everything else (Office, Furniture, Computer, Vehicle, Machinery, etc.)
  // goes into Office Equipments so nothing is silently dropped.
  return "Office Equipments";
};

// ── Main component ────────────────────────────────────────────────────────────

const QuarterlyReportButton = ({
  rowData = [],
  selectedFiscalYear,
  selectedQuarter,
}) => {
  const [loading, setLoading] = useState(false);

  const canGenerate =
    selectedQuarter && selectedQuarter !== "ALL" && selectedFiscalYear != null;

  const generateReport = async () => {
    if (!canGenerate) return;
    setLoading(true);

    try {
      const qStr = String(selectedQuarter);
      const qNum = Number(qStr);
      const qCfg = FY_QUARTERS[qStr];
      if (!qCfg) return;

      const fy = Number(selectedFiscalYear);
      const qFirstFiscalPos = firstPosOfQuarter(qNum);
      const qLastFiscalPos = lastPosOfQuarter(qNum);

      const qMonths = qCfg.monthDefs.map((d) => ({
        calYear: fy + d.yearOffset,
        month: d.month,
      }));

      const zero = () => ({
        lifetimeCostBeg: 0,
        additions: 0,
        accumDepBeg: 0,
        dep: [0, 0, 0],
        endingNBV: 0,
      });
      const buckets = {
        "Office Equipments": zero(),
        "Tools Assets": zero(),
        "Rental Equipments": zero(),
      };

      // Re-bucket the SAME rows the dashboard already computed and displayed —
      // no separate NBV/depreciation math here, so this can't drift from the screen.
      rowData.forEach(({ asset, beginningNBV, endingNBV, deps }) => {
        const bucket = getBucket(asset.category);
        const qty = asset.qty || 1;
        const cost = (Number(asset.assetCost) || 0) * qty;

        const purchase = new Date(asset.purchaseDate);
        const pFY = getFiscalYearLabel(
          purchase.getFullYear(),
          purchase.getMonth(),
        );
        const pPos = fiscalPos(purchase.getMonth());

        const purchasedBeforeQStart =
          pFY < fy || (pFY === fy && pPos < qFirstFiscalPos);
        const purchasedInQuarter =
          pFY === fy && pPos >= qFirstFiscalPos && pPos <= qLastFiscalPos;

        if (purchasedBeforeQStart) buckets[bucket].lifetimeCostBeg += cost;
        if (purchasedInQuarter) buckets[bucket].additions += cost;

        buckets[bucket].accumDepBeg += Math.max(cost - beginningNBV, 0);
        buckets[bucket].endingNBV += endingNBV;

        deps.forEach((d, i) => {
          buckets[bucket].dep[i] += d || 0;
        });
      });

      const lifetimeCostEnd = (bk) =>
        buckets[bk].lifetimeCostBeg + buckets[bk].additions;
      const accumDepEnd = (bk) =>
        buckets[bk].accumDepBeg +
        buckets[bk].dep[0] +
        buckets[bk].dep[1] +
        buckets[bk].dep[2];
      const nbv = (bk) => buckets[bk].endingNBV; // pulled straight from the dashboard's own total

      const totalDepArr = [0, 1, 2].map((i) =>
        BUCKET_LABELS.reduce((s, bk) => s + buckets[bk].dep[i], 0),
      );

      const lastDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const qMonthLabels = qMonths.map(({ calYear, month }) => {
        const d = lastDaysInMonth[month];
        return `${String(month + 1).padStart(2, "0")}/${d}/${calYear}`;
      });

      // ── 5. Build Excel ────────────────────────────────────────────────────
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(qCfg.sheetName(fy));

      ws.columns = [
        { width: 62 }, // A – labels
        { width: 18 }, // B – Office
        { width: 14 }, // C – Tools
        { width: 18 }, // D – Rental
        { width: 18 }, // E – TOTAL
      ];

      // Style constants
      const MONEY = "#,##0.00";
      const RIGHT = { horizontal: "right" };
      const CENTER = { horizontal: "center" };
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
      const THIN = { style: "thin", color: { argb: "FFB8CCE4" } };
      const THICK = { style: "medium", color: { argb: "FF2F75B6" } };
      const font10 = (bold = false) => ({ bold, size: 10, name: "Calibri" });

      const addMoney = (row, col, value, fill) => {
        const cell = row.getCell(col);
        cell.value = value;
        cell.numFmt = MONEY;
        cell.alignment = RIGHT;
        if (fill) cell.fill = fill;
      };

      const addLabel = (row, text, indent = 0, bold = false) => {
        const cell = row.getCell(1);
        cell.value = "  ".repeat(indent) + text;
        cell.font = font10(bold);
      };

      const applyTotalBorder = (row) => {
        [2, 3, 4, 5].forEach((col) => {
          const cell = row.getCell(col);
          cell.border = { top: THICK, bottom: THICK };
          cell.font = font10(true);
        });
      };

      const prevEndStr = qCfg.prevEndLabel(fy);
      const curEndStr = qCfg.endLabel(fy);
      const curEndDisp = qCfg.endDisplay(fy);

      // ── ROW 1  Title ─────────────────────────────────────────────────────
      const r1 = ws.addRow([
        `PrimeSales Qtrly_ FY-${fy}-${fy + 1} EQUIPMENT ASSETS GROSS DEPRECIATION`,
      ]);
      r1.getCell(1).font = { bold: true, size: 13, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, 5);
      r1.getCell(1).alignment = CENTER;

      // ── ROW 2  As of ─────────────────────────────────────────────────────
      const r2 = ws.addRow([`As of ${curEndDisp}`]);
      r2.getCell(1).font = { italic: true, size: 10, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, 5);
      r2.getCell(1).alignment = CENTER;

      ws.addRow([]); // blank row 3

      // ── ROWS 4-5  Column headers ──────────────────────────────────────────
      const r4 = ws.addRow(["", "Office", "Tools", "Rental", "TOTAL"]);
      const r5 = ws.addRow(["", "Equipments", "Assets", "Equipments", ""]);
      [r4, r5].forEach((r) => {
        [2, 3, 4, 5].forEach((col) => {
          const cell = r.getCell(col);
          cell.font = font10(true);
          cell.alignment = CENTER;
          cell.fill = HEADER_FILL;
          cell.border = { top: THIN, bottom: THIN, left: THIN, right: THIN };
        });
      });

      ws.addRow([]); // blank row 6

      // ════════════════════════════════════════════════════════════════════
      //  COST SECTION
      // ════════════════════════════════════════════════════════════════════
      const rCostHdr = ws.addRow(["   Cost"]);
      rCostHdr.getCell(1).font = font10(true);

      const rCostBeg = ws.addRow([]);
      addLabel(rCostBeg, `Life Time balance as of ${prevEndStr}`, 2);
      BUCKET_LABELS.forEach((bk, i) =>
        addMoney(rCostBeg, i + 2, buckets[bk].lifetimeCostBeg),
      );
      addMoney(
        rCostBeg,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + buckets[bk].lifetimeCostBeg, 0),
      );

      const rAdd = ws.addRow([]);
      addLabel(rAdd, "Additions", 2);
      BUCKET_LABELS.forEach((bk, i) =>
        addMoney(rAdd, i + 2, buckets[bk].additions),
      );
      addMoney(
        rAdd,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + buckets[bk].additions, 0),
      );

      ws.addRow([]); // blank

      const rCostEnd = ws.addRow([]);
      addLabel(rCostEnd, `Lifetime cost Balance as of ${curEndStr}`, 0, true);
      BUCKET_LABELS.forEach((bk, i) =>
        addMoney(rCostEnd, i + 2, lifetimeCostEnd(bk), TOTAL_FILL),
      );
      addMoney(
        rCostEnd,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + lifetimeCostEnd(bk), 0),
        TOTAL_FILL,
      );
      applyTotalBorder(rCostEnd);

      ws.addRow([]); // blank

      // ════════════════════════════════════════════════════════════════════
      //  ACCUMULATED DEPRECIATION SECTION
      // ════════════════════════════════════════════════════════════════════
      const rAccHdr = ws.addRow(["   Accumulated Depreciation"]);
      rAccHdr.getCell(1).font = font10(true);

      const rAccBeg = ws.addRow([]);
      addLabel(
        rAccBeg,
        `Lifetime accumulated depreciation as of  ${prevEndStr}`,
        2,
      );
      BUCKET_LABELS.forEach((bk, i) =>
        addMoney(rAccBeg, i + 2, buckets[bk].accumDepBeg),
      );
      addMoney(
        rAccBeg,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + buckets[bk].accumDepBeg, 0),
      );

      // 3 monthly depreciation rows
      qMonths.forEach(({ calYear, month }, i) => {
        const rDep = ws.addRow([]);
        addLabel(rDep, `Depreciation ${qMonthLabels[i]}`, 2);
        BUCKET_LABELS.forEach((bk, bi) =>
          addMoney(rDep, bi + 2, buckets[bk].dep[i]),
        );
        addMoney(rDep, 5, totalDepArr[i]);
      });

      const rAccEnd = ws.addRow([]);
      addLabel(rAccEnd, `Depreciation Balance of ${curEndStr}`, 0, true);
      BUCKET_LABELS.forEach((bk, i) =>
        addMoney(rAccEnd, i + 2, accumDepEnd(bk), TOTAL_FILL),
      );
      addMoney(
        rAccEnd,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + accumDepEnd(bk), 0),
        TOTAL_FILL,
      );
      applyTotalBorder(rAccEnd);

      ws.addRow([]); // blank

      // ════════════════════════════════════════════════════════════════════
      //  NET BOOK VALUE
      // ════════════════════════════════════════════════════════════════════
      const rNBV = ws.addRow([]);
      addLabel(rNBV, `NET BOOK VALUE as of ${curEndStr}`, 0, true);
      BUCKET_LABELS.forEach((bk, i) => {
        const cell = rNBV.getCell(i + 2);
        cell.value = nbv(bk);
        cell.numFmt = MONEY;
        cell.alignment = RIGHT;
        cell.fill = NBV_FILL;
        cell.font = {
          bold: true,
          size: 10,
          name: "Calibri",
          color: { argb: "FF1F3864" },
        };
        cell.border = { top: THICK, bottom: THICK };
      });
      const totalNBVCell = rNBV.getCell(5);
      totalNBVCell.value = BUCKET_LABELS.reduce((s, bk) => s + nbv(bk), 0);
      totalNBVCell.numFmt = MONEY;
      totalNBVCell.alignment = RIGHT;
      totalNBVCell.fill = NBV_FILL;
      totalNBVCell.font = {
        bold: true,
        size: 11,
        name: "Calibri",
        color: { argb: "FF1F3864" },
      };
      totalNBVCell.border = { top: THICK, bottom: THICK };

      ws.addRow([]); // blank

      // ── Footer ────────────────────────────────────────────────────────────
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
      rPrep.getCell(1).font = font10(true);

      ws.views = [{ state: "frozen", xSplit: 0, ySplit: 5 }];
      ws.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
      };

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        qCfg.fileName(fy),
      );
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = (() => {
    if (!canGenerate) return "Generate Report";
    return (
      FY_QUARTERS[String(selectedQuarter)]?.buttonLabel(
        Number(selectedFiscalYear),
      ) ?? "Generate Report"
    );
  })();

  const tooltip = canGenerate
    ? buttonLabel
    : "Select a specific quarter (not Full Year) to generate the report";

  return (
    <button
      onClick={generateReport}
      disabled={!canGenerate || loading}
      title={tooltip}
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
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
          {buttonLabel}
        </>
      )}
    </button>
  );
};

export default QuarterlyReportButton;
