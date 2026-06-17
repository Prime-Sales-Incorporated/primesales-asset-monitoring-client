// src/admin/OCSI/pages/reports/depreciation-report.jsx
//
// This file IS the OCSIQuarterlyReportButton component.
// It is imported by AssetDepreciationDashboard as:
//   import OCSIQuarterlyReportButton from "./reports/depreciation-report";
//
// Props
// ─────
// rowData        – visibleRowData from the dashboard (all values already qty-multiplied)
//                  shape: [{ asset, beginningNBV, endingNBV, deps, periodTotal }]
// selectedYear   – number e.g. 2026
// selectedQuarter– "1"|"2"|"3"|"4"|"ALL"
//
// The button is ENABLED only when selectedQuarter is "1"–"4".
// When "ALL" is selected it shows greyed with a tooltip explaining why.

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ── Quarter config (calendar year, 0-based months) ───────────────────────────
const QUARTER_CONFIG = {
  1: {
    months: [0, 1, 2], // Jan Feb Mar
    endLabel: (y) => `03/31/${y}`,
    endDisplay: (y) => `March 31, ${y}`,
    prevEndLabel: (y) => `12/31/${y - 1}`,
    sheetName: (y) => `Q1 ${y}`,
    fileName: (y) => `OCSI_Qtrly_Q1_${y}.xlsx`,
    buttonLabel: (y) => `Report as of Mar 31 ${y}`,
  },
  2: {
    months: [3, 4, 5], // Apr May Jun
    endLabel: (y) => `06/30/${y}`,
    endDisplay: (y) => `June 30, ${y}`,
    prevEndLabel: (y) => `03/31/${y}`,
    sheetName: (y) => `Q2 ${y}`,
    fileName: (y) => `OCSI_Qtrly_Q2_${y}.xlsx`,
    buttonLabel: (y) => `Report as of Jun 30 ${y}`,
  },
  3: {
    months: [6, 7, 8], // Jul Aug Sep
    endLabel: (y) => `09/30/${y}`,
    endDisplay: (y) => `September 30, ${y}`,
    prevEndLabel: (y) => `06/30/${y}`,
    sheetName: (y) => `Q3 ${y}`,
    fileName: (y) => `OCSI_Qtrly_Q3_${y}.xlsx`,
    buttonLabel: (y) => `Report as of Sep 30 ${y}`,
  },
  4: {
    months: [9, 10, 11], // Oct Nov Dec
    endLabel: (y) => `12/31/${y}`,
    endDisplay: (y) => `December 31, ${y}`,
    prevEndLabel: (y) => `09/30/${y}`,
    sheetName: (y) => `Q4 ${y}`,
    fileName: (y) => `OCSI_Qtrly_Q4_${y}.xlsx`,
    buttonLabel: (y) => `Report as of Dec 31 ${y}`,
  },
};

// ── Category → report bucket ──────────────────────────────────────────────────
// Unrecognised categories fall into "Office Equipments" — nothing is dropped.
const getBucket = (category) => {
  if (!category) return "Office Equipments";
  const c = category.trim().toLowerCase();
  if (c.includes("rental")) return "Rental Equipments";
  if (c.includes("tool")) return "Tools Assets";
  return "Office Equipments";
};

const BUCKET_LABELS = [
  "Office Equipments",
  "Tools Assets",
  "Rental Equipments",
];

// ── Component ─────────────────────────────────────────────────────────────────
const OCSIQuarterlyReportButton = ({
  rowData = [],
  selectedYear,
  selectedQuarter,
}) => {
  const [loading, setLoading] = useState(false);

  // Only active when a specific quarter is chosen
  const canGenerate =
    selectedQuarter !== undefined &&
    selectedQuarter !== null &&
    selectedQuarter !== "ALL" &&
    selectedYear != null;

  const generateReport = async () => {
    if (!canGenerate || loading) return;
    setLoading(true);

    try {
      const qStr = String(selectedQuarter);
      const qCfg = QUARTER_CONFIG[qStr];
      if (!qCfg) {
        setLoading(false);
        return;
      }

      const year = Number(selectedYear);
      const firstQMonth = qCfg.months[0]; // 0-based, e.g. 0 for Jan
      const lastQMonth = qCfg.months[2]; // 0-based, e.g. 2 for Mar

      // ── Aggregate rowData into 3 buckets ──────────────────────────────
      // rowData entries already have all monetary values × qty.
      // We just classify and sum — no extra math.
      const zero = () => ({
        lifetimeCostBeg: 0,
        additions: 0,
        accumDepBeg: 0, // cost×qty − beginningNBV
        dep: [0, 0, 0],
        endingNBV: 0,
      });

      const buckets = {
        "Office Equipments": zero(),
        "Tools Assets": zero(),
        "Rental Equipments": zero(),
      };

      rowData.forEach(({ asset, beginningNBV, endingNBV, deps }) => {
        const bucket = getBucket(asset.category);
        const b = buckets[bucket];
        const qty = asset.qty || 1;
        const cost = (Number(asset.assetCost) || 0) * qty;

        const purchase = new Date(asset.purchaseDate);
        const pYear = purchase.getFullYear();
        const pMonth = purchase.getMonth(); // 0-based

        // Cost classification
        const beforeQStart =
          pYear < year || (pYear === year && pMonth < firstQMonth);
        const inQuarter =
          pYear === year && pMonth >= firstQMonth && pMonth <= lastQMonth;

        if (beforeQStart) b.lifetimeCostBeg += cost;
        if (inQuarter) b.additions += cost;

        // Accumulated dep at start of this quarter = cost − beginningNBV
        b.accumDepBeg += Math.max(cost - beginningNBV, 0);

        // Monthly dep — deps[] has exactly 3 entries when a quarter is selected
        deps.forEach((d, i) => {
          b.dep[i] += d || 0;
        });

        // Ending NBV straight from the dashboard
        b.endingNBV += endingNBV;
      });

      // ── Derived values ────────────────────────────────────────────────
      const lifetimeCostEnd = (bk) =>
        buckets[bk].lifetimeCostBeg + buckets[bk].additions;

      const accumDepEnd = (bk) =>
        buckets[bk].accumDepBeg +
        buckets[bk].dep[0] +
        buckets[bk].dep[1] +
        buckets[bk].dep[2];

      const nbv = (bk) => buckets[bk].endingNBV; // sourced from dashboard, matches screen

      const totalDepArr = [0, 1, 2].map((i) =>
        BUCKET_LABELS.reduce((s, bk) => s + (buckets[bk].dep[i] || 0), 0),
      );

      // Month label strings  e.g. "01/31/2026"
      const lastDayMap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const qMonthLabels = qCfg.months.map(
        (m) => `${String(m + 1).padStart(2, "0")}/${lastDayMap[m]}/${year}`,
      );

      const prevEndStr = qCfg.prevEndLabel(year);
      const curEndStr = qCfg.endLabel(year);
      const curEndDisp = qCfg.endDisplay(year);

      // ── Build Excel ───────────────────────────────────────────────────
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(qCfg.sheetName(year));

      ws.columns = [
        { width: 62 }, // A – labels
        { width: 18 }, // B – Office Equipments
        { width: 14 }, // C – Tools Assets
        { width: 18 }, // D – Rental Equipments
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
      const f10 = (bold = false) => ({ bold, size: 10, name: "Calibri" });

      const $money = (row, col, val, fill) => {
        const c = row.getCell(col);
        c.value = val;
        c.numFmt = MONEY;
        c.alignment = RIGHT;
        if (fill) c.fill = fill;
      };
      const $label = (row, text, indent = 0, bold = false) => {
        const c = row.getCell(1);
        c.value = "  ".repeat(indent) + text;
        c.font = f10(bold);
      };
      const $totalBorder = (row) => {
        [2, 3, 4, 5].forEach((col) => {
          const c = row.getCell(col);
          c.border = { top: THICK, bottom: THICK };
          c.font = f10(true);
        });
      };

      // Row 1 — Title
      const r1 = ws.addRow([
        `OCSI Qtrly_ CY-${year} EQUIPMENT ASSETS GROSS DEPRECIATION`,
      ]);
      r1.getCell(1).font = { bold: true, size: 13, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, 5);
      r1.getCell(1).alignment = CENTER;

      // Row 2 — As of
      const r2 = ws.addRow([`As of ${curEndDisp}`]);
      r2.getCell(1).font = { italic: true, size: 10, name: "Calibri" };
      ws.mergeCells(ws.rowCount, 1, ws.rowCount, 5);
      r2.getCell(1).alignment = CENTER;

      ws.addRow([]); // Row 3 blank

      // Rows 4-5 — Column headers
      const r4 = ws.addRow(["", "Office", "Tools", "Rental", "TOTAL"]);
      const r5 = ws.addRow(["", "Equipments", "Assets", "Equipments", ""]);
      [r4, r5].forEach((r) =>
        [2, 3, 4, 5].forEach((col) => {
          const c = r.getCell(col);
          c.font = f10(true);
          c.alignment = CENTER;
          c.fill = HEADER_FILL;
          c.border = { top: THIN, bottom: THIN, left: THIN, right: THIN };
        }),
      );

      ws.addRow([]); // Row 6 blank

      // ── COST ─────────────────────────────────────────────────────────
      ws.addRow(["   Cost"]).getCell(1).font = f10(true);

      const rCostBeg = ws.addRow([]);
      $label(rCostBeg, `Life Time balance as of ${prevEndStr}`, 2);
      BUCKET_LABELS.forEach((bk, i) =>
        $money(rCostBeg, i + 2, buckets[bk].lifetimeCostBeg),
      );
      $money(
        rCostBeg,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + buckets[bk].lifetimeCostBeg, 0),
      );

      const rAdd = ws.addRow([]);
      $label(rAdd, "Additions", 2);
      BUCKET_LABELS.forEach((bk, i) =>
        $money(rAdd, i + 2, buckets[bk].additions),
      );
      $money(
        rAdd,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + buckets[bk].additions, 0),
      );

      ws.addRow([]);

      const rCostEnd = ws.addRow([]);
      $label(rCostEnd, `Lifetime cost Balance as of ${curEndStr}`, 0, true);
      BUCKET_LABELS.forEach((bk, i) =>
        $money(rCostEnd, i + 2, lifetimeCostEnd(bk), TOTAL_FILL),
      );
      $money(
        rCostEnd,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + lifetimeCostEnd(bk), 0),
        TOTAL_FILL,
      );
      $totalBorder(rCostEnd);

      ws.addRow([]);

      // ── ACCUMULATED DEPRECIATION ──────────────────────────────────────
      ws.addRow(["   Accumulated Depreciation"]).getCell(1).font = f10(true);

      const rAccBeg = ws.addRow([]);
      $label(
        rAccBeg,
        `Lifetime accumulated depreciation as of  ${prevEndStr}`,
        2,
      );
      BUCKET_LABELS.forEach((bk, i) =>
        $money(rAccBeg, i + 2, buckets[bk].accumDepBeg),
      );
      $money(
        rAccBeg,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + buckets[bk].accumDepBeg, 0),
      );

      qCfg.months.forEach((m, i) => {
        const rDep = ws.addRow([]);
        $label(rDep, `Depreciation ${qMonthLabels[i]}`, 2);
        BUCKET_LABELS.forEach((bk, bi) =>
          $money(rDep, bi + 2, buckets[bk].dep[i] || 0),
        );
        $money(rDep, 5, totalDepArr[i]);
      });

      const rAccEnd = ws.addRow([]);
      $label(rAccEnd, `Depreciation Balance of ${curEndStr}`, 0, true);
      BUCKET_LABELS.forEach((bk, i) =>
        $money(rAccEnd, i + 2, accumDepEnd(bk), TOTAL_FILL),
      );
      $money(
        rAccEnd,
        5,
        BUCKET_LABELS.reduce((s, bk) => s + accumDepEnd(bk), 0),
        TOTAL_FILL,
      );
      $totalBorder(rAccEnd);

      ws.addRow([]);

      // ── NET BOOK VALUE ────────────────────────────────────────────────
      const rNBV = ws.addRow([]);
      $label(rNBV, `NET BOOK VALUE as of ${curEndStr}`, 0, true);
      BUCKET_LABELS.forEach((bk, i) => {
        const c = rNBV.getCell(i + 2);
        c.value = nbv(bk);
        c.numFmt = MONEY;
        c.alignment = RIGHT;
        c.fill = NBV_FILL;
        c.font = {
          bold: true,
          size: 10,
          name: "Calibri",
          color: { argb: "FF1F3864" },
        };
        c.border = { top: THICK, bottom: THICK };
      });
      const nbvTotal = rNBV.getCell(5);
      nbvTotal.value = BUCKET_LABELS.reduce((s, bk) => s + nbv(bk), 0);
      nbvTotal.numFmt = MONEY;
      nbvTotal.alignment = RIGHT;
      nbvTotal.fill = NBV_FILL;
      nbvTotal.font = {
        bold: true,
        size: 11,
        name: "Calibri",
        color: { argb: "FF1F3864" },
      };
      nbvTotal.border = { top: THICK, bottom: THICK };

      ws.addRow([]);

      // ── Footer ────────────────────────────────────────────────────────
      ws
        .addRow([
          "*Understated Rental Equipments Purchased Costs from Previous FS",
        ])
        .getCell(1).font = {
        italic: true,
        size: 9,
        name: "Calibri",
        color: { argb: "FF666666" },
      };
      ws.addRow([]);
      ws.addRow(["   PREPARED BY:"]).getCell(1).font = f10(true);

      ws.views = [{ state: "frozen", xSplit: 0, ySplit: 5 }];
      ws.pageSetup = {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
      };

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        qCfg.fileName(year),
      );
    } catch (err) {
      console.error("Report generation failed:", err);
      alert(
        "Failed to generate report. Check the browser console for details.",
      );
    } finally {
      setLoading(false);
    }
  };

  const btnLabel = canGenerate
    ? (QUARTER_CONFIG[String(selectedQuarter)]?.buttonLabel(
        Number(selectedYear),
      ) ?? "Generate Report")
    : "Generate Report";

  const tooltip = canGenerate
    ? btnLabel
    : "Select Q1–Q4 (not Full Year) to enable this report";

  return (
    <button
      type="button"
      onClick={generateReport}
      disabled={!canGenerate || loading}
      title={tooltip}
      className={[
        "flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-semibold transition select-none",
        canGenerate && !loading
          ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer"
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
          {btnLabel}
        </>
      )}
    </button>
  );
};

export default OCSIQuarterlyReportButton;
