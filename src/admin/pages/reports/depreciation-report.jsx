// QuarterlyReportButton.jsx
//
// Drop-in "Generate Report" button for the PrimeSales AssetDepreciationDashboard.
// Reads the same rows already computed by the parent and produces a
// Quarterly Depreciation Report Excel file matching the OCSI "MARCH 2026 (2)"
// layout — adapted for PrimeSales' FISCAL year (Jun–May).
//
// One column is generated for EVERY distinct asset category found in the data,
// followed by a TOTAL column, so report totals always equal dashboard totals.
//
// Fiscal Year quarters (FY starts June 1):
//   Q1 → Jun, Jul, Aug  (selectedFiscalYear)
//   Q2 → Sep, Oct, Nov  (selectedFiscalYear)
//   Q3 → Dec, Jan, Feb  (selectedFiscalYear / selectedFiscalYear+1)
//   Q4 → Mar, Apr, May  (selectedFiscalYear+1)
//
// Props
// ─────
// rowData            – array of { asset, beginningNBV, endingNBV, deps } rows
//                      (the same rows the dashboard already computed/displayed)
// selectedFiscalYear – number, e.g. 2025  (means FY 2025-2026)
// selectedQuarter    – "1" | "2" | "3" | "4"  (NOT "ALL" — button disables for ALL)

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getFiscalYearLabel,
  fiscalPos,
  firstPosOfQuarter,
  lastPosOfQuarter,
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

// ── Category → column ─────────────────────────────────────────────────────────
// Every distinct category gets its own column. Blank categories are grouped
// under "Uncategorized" so nothing is silently dropped.
const getBucket = (category) =>
  (category && String(category).trim()) || "Uncategorized";

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

      // ── Build one bucket per distinct category ──────────────────────────
      const zero = () => ({
        lifetimeCostBeg: 0,
        additions: 0,
        accumDepBeg: 0,
        dep: [0, 0, 0],
        endingNBV: 0,
      });

      const bucketLabels = [
        ...new Set(rowData.map(({ asset }) => getBucket(asset.category))),
      ].sort((a, b) => a.localeCompare(b));

      const buckets = Object.fromEntries(
        bucketLabels.map((bk) => [bk, zero()]),
      );

      // Column layout: A = labels, B.. = categories, last = TOTAL
      const totalCol = bucketLabels.length + 2;

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

        // Asset doesn't exist yet as of this quarter — exclude it entirely
        const purchasedAfterQEnd =
          pFY > fy || (pFY === fy && pPos > qLastFiscalPos);
        if (purchasedAfterQEnd) return;

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
      const nbv = (bk) => buckets[bk].endingNBV; // straight from the dashboard's own total
      const sumAll = (fn) => bucketLabels.reduce((s, bk) => s + fn(bk), 0);

      const lastDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const qMonthLabels = qMonths.map(({ calYear, month }) => {
        const d = lastDaysInMonth[month];
        return `${String(month + 1).padStart(2, "0")}/${d}/${calYear}`;
      });

      // ── Build Excel ─────────────────────────────────────────────────────
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(qCfg.sheetName(fy));

      ws.columns = [
        { width: 62 }, // A – labels
        ...bucketLabels.map(() => ({ width: 18 })), // one per category
        { width: 18 }, // TOTAL
      ];

      // Style constants
      const MONEY = "#,##0.00";
      const RIGHT = { horizontal: "right" };
      const CENTER = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      const solid = (argb) => ({
        type: "pattern",
        pattern: "solid",
        fgColor: { argb },
      });
      const HEADER_FILL = solid("FFD9E1F2");
      const TOTAL_FILL = solid("FFE2EFDA");
      const NBV_FILL = solid("FFDCE6F1");
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

      // Writes one value per category + the TOTAL column
      const addValuesRow = (row, fn, fill) => {
        bucketLabels.forEach((bk, i) => addMoney(row, i + 2, fn(bk), fill));
        addMoney(row, totalCol, sumAll(fn), fill);
      };

      const applyTotalBorder = (row) => {
        for (let col = 2; col <= totalCol; col++) {
          const cell = row.getCell(col);
          cell.border = { top: THICK, bottom: THICK };
          cell.font = font10(true);
        }
      };

      const prevEndStr = qCfg.prevEndLabel(fy);
      const curEndStr = qCfg.endLabel(fy);
      const curEndDisp = qCfg.endDisplay(fy);

      // ── Title ───────────────────────────────────────────────────────────
      const r1 = ws.addRow([
        `PrimeSales Qtrly_ FY-${fy}-${fy + 1} EQUIPMENT ASSETS GROSS DEPRECIATION`,
      ]);
      r1.getCell(1).font = { bold: true, size: 13, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, totalCol);
      r1.getCell(1).alignment = CENTER;

      // ── As of ───────────────────────────────────────────────────────────
      const r2 = ws.addRow([`As of ${curEndDisp}`]);
      r2.getCell(1).font = { italic: true, size: 10, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, totalCol);
      r2.getCell(1).alignment = CENTER;

      ws.addRow([]); // blank

      // ── Column headers: one per category + TOTAL ────────────────────────
      const rHdr = ws.addRow(["", ...bucketLabels, "TOTAL"]);
      rHdr.height = 32;
      for (let col = 2; col <= totalCol; col++) {
        const cell = rHdr.getCell(col);
        cell.font = font10(true);
        cell.alignment = CENTER;
        cell.fill = HEADER_FILL;
        cell.border = { top: THIN, bottom: THIN, left: THIN, right: THIN };
      }

      ws.addRow([]); // blank

      // ════════════════════════════════════════════════════════════════════
      //  COST SECTION
      // ════════════════════════════════════════════════════════════════════
      ws.addRow(["   Cost"]).getCell(1).font = font10(true);

      const rCostBeg = ws.addRow([]);
      addLabel(rCostBeg, `Life Time balance as of ${prevEndStr}`, 2);
      addValuesRow(rCostBeg, (bk) => buckets[bk].lifetimeCostBeg);

      const rAdd = ws.addRow([]);
      addLabel(rAdd, "Additions", 2);
      addValuesRow(rAdd, (bk) => buckets[bk].additions);

      ws.addRow([]); // blank

      const rCostEnd = ws.addRow([]);
      addLabel(rCostEnd, `Lifetime cost Balance as of ${curEndStr}`, 0, true);
      addValuesRow(rCostEnd, lifetimeCostEnd, TOTAL_FILL);
      applyTotalBorder(rCostEnd);

      ws.addRow([]); // blank

      // ════════════════════════════════════════════════════════════════════
      //  ACCUMULATED DEPRECIATION SECTION
      // ════════════════════════════════════════════════════════════════════
      ws.addRow(["   Accumulated Depreciation"]).getCell(1).font = font10(true);

      const rAccBeg = ws.addRow([]);
      addLabel(
        rAccBeg,
        `Lifetime accumulated depreciation as of  ${prevEndStr}`,
        2,
      );
      addValuesRow(rAccBeg, (bk) => buckets[bk].accumDepBeg);

      // 3 monthly depreciation rows
      qMonths.forEach((_, i) => {
        const rDep = ws.addRow([]);
        addLabel(rDep, `Depreciation ${qMonthLabels[i]}`, 2);
        addValuesRow(rDep, (bk) => buckets[bk].dep[i]);
      });

      const rAccEnd = ws.addRow([]);
      addLabel(rAccEnd, `Depreciation Balance of ${curEndStr}`, 0, true);
      addValuesRow(rAccEnd, accumDepEnd, TOTAL_FILL);
      applyTotalBorder(rAccEnd);

      ws.addRow([]); // blank

      // ════════════════════════════════════════════════════════════════════
      //  NET BOOK VALUE
      // ════════════════════════════════════════════════════════════════════
      const rNBV = ws.addRow([]);
      addLabel(rNBV, `NET BOOK VALUE as of ${curEndStr}`, 0, true);
      addValuesRow(rNBV, nbv, NBV_FILL);
      for (let col = 2; col <= totalCol; col++) {
        const cell = rNBV.getCell(col);
        cell.font = {
          bold: true,
          size: col === totalCol ? 11 : 10,
          name: "Calibri",
          color: { argb: "FF1F3864" },
        };
        cell.border = { top: THICK, bottom: THICK };
      }

      ws.addRow([]); // blank

      // ── Footer ──────────────────────────────────────────────────────────
      // Only show the rental note when a rental category actually exists
      if (bucketLabels.some((bk) => bk.toLowerCase().includes("rental"))) {
        const rNote = ws.addRow([
          "*Understated Rental Equipments Purchased Costs from Previous FS",
        ]);
        rNote.getCell(1).font = {
          italic: true,
          size: 9,
          name: "Calibri",
          color: { argb: "FF666666" },
        };
      }
      ws.addRow([]);
      ws.addRow(["   PREPARED BY:"]).getCell(1).font = font10(true);

      ws.views = [{ state: "frozen", xSplit: 0, ySplit: 4 }];
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
