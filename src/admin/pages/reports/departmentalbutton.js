// DepartmentalReportButton.jsx  (single self-contained file)
//
// "FIXED ASSETS (Departmentalized)" quarterly report, laid out like the
// accounting file "DEPRECIATION … KEN.xls". A department is listed only if it
// has depreciation inside the selected quarter (departments with 0 depreciation
// for the 3 months are left out).
//
// Props
//   rowData            – UNFILTERED dashboard rows { asset, beginningNBV, endingNBV, deps[3] }
//   selectedFiscalYear – number, e.g. 2026 (FY 2026-2027)
//   selectedQuarter    – "1" | "2" | "3" | "4"  ("ALL" disables the button)

import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  getFiscalYearLabel,
  fiscalPos,
  firstPosOfQuarter,
  lastPosOfQuarter,
} from "../../../helpers/depreciationHelper";

// ── Fixed chart of accounts, in the order used by the accounting file ────────
// match  : regex tested against asset.category
// head   : two-line column header
// costAcct / accAcct : Acumatica accounts (accAcct is also the dep-expense acct)
const CATEGORY_DEFS = [
  {
    key: "land",
    match: /land/i,
    head: ["Land", "Property"],
    costAcct: 1020100000,
    accAcct: null,
  },
  {
    key: "bldgImp",
    match: /(building|bldn?g)\.?\s*imp/i,
    head: ["Building", "Improvements"],
    costAcct: 1021500000,
    accAcct: 1021600000,
  },
  {
    key: "officeBldg",
    match: /office\s*(building|bldn?g)/i,
    head: ["Office", "Building"],
    costAcct: 1021300000,
    accAcct: 1021400000,
  },
  {
    key: "rental",
    match: /rental/i,
    head: ["Rental", "Equipments"],
    costAcct: 1020900000,
    accAcct: 1021000000,
  },
  {
    key: "vehicles",
    match: /vehicle/i,
    head: ["Service", "Vehicles"],
    costAcct: 1021700000,
    accAcct: 1021800000,
  },
  {
    key: "leasehold",
    match: /leasehold/i,
    head: ["Leasehold", "Improvements"],
    costAcct: 1020600000,
    accAcct: 1020700000,
  },
  {
    key: "tools",
    match: /tool/i,
    head: ["Tools", "Assets"],
    costAcct: 1021100000,
    accAcct: 1021200000,
  },
  {
    key: "equip",
    match: /equip|eqpt|furnitur/i,
    head: ["Equipments,", "Furnitures"],
    costAcct: 1020400000,
    accAcct: 1020500000,
  },
];

// Column order of the Departmentalized sheet (Land is not depreciated)
const DEPT_ORDER = [
  "equip",
  "leasehold",
  "rental",
  "tools",
  "officeBldg",
  "bldgImp",
  "vehicles",
];

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];
const MONTH_ABBR = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };

// month = 0-based calendar month, yearOffset = added to the fiscal-year start year
const QUARTER_MONTHS = {
  1: [
    { month: 5, yo: 0 },
    { month: 6, yo: 0 },
    { month: 7, yo: 0 },
  ],
  2: [
    { month: 8, yo: 0 },
    { month: 9, yo: 0 },
    { month: 10, yo: 0 },
  ],
  3: [
    { month: 11, yo: 0 },
    { month: 0, yo: 1 },
    { month: 1, yo: 1 },
  ],
  4: [
    { month: 2, yo: 1 },
    { month: 3, yo: 1 },
    { month: 4, yo: 1 },
  ],
};

const MONEY = "#,##0.00";
const ACCT = "0";
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const blankIfZero = (n) => (Math.abs(n) < 0.005 ? null : r2(n));
const pad = (n) => String(n).padStart(2, "0");
const mdy = (d, fullYear = true) =>
  `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${fullYear ? d.getFullYear() : String(d.getFullYear()).slice(2)}`;

// (NEW) "ALL" is the dashboard's "no filter" placeholder, not a real category
// or department — it must never appear in the report.
const isAllPlaceholder = (v) => /^\s*all\s*$/i.test(String(v ?? ""));

const colLetter = (c) => {
  let s = "";
  while (c > 0) {
    const m = (c - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    c = Math.floor((c - 1) / 26);
  }
  return s;
};

const solid = (argb) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb },
});
const FILL_TOTAL = solid("FFE2EFDA");
const FILL_HEAD = solid("FFD9E1F2");
const THIN = { style: "thin" };
const DOUBLE = { style: "double" };

function buildDepartmentalWorkbook({
  rowData,
  fiscalYear,
  quarter,
  preparedBy = { name: "Kenneth Orbina", title: "Accounting Staff" },
}) {
  const fy = Number(fiscalYear);
  const qNum = Number(quarter);
  const qMonths = QUARTER_MONTHS[qNum].map(({ month, yo }) => ({
    month,
    year: fy + yo,
  }));
  const prevEnd = new Date(qMonths[0].year, qMonths[0].month, 0);
  const curEnd = new Date(qMonths[2].year, qMonths[2].month + 1, 0);
  const monthEnds = qMonths.map(
    ({ year, month }) => new Date(year, month + 1, 0),
  );

  const qFirst = firstPosOfQuarter(qNum);
  const qLast = lastPosOfQuarter(qNum);

  // ── Resolve category keys (known ones + any unknown extras) ───────────────
  const defsByKey = Object.fromEntries(CATEGORY_DEFS.map((d) => [d.key, d]));
  const keyOf = (category) => {
    const name = (category && String(category).trim()) || "Uncategorized";
    const def = CATEGORY_DEFS.find((d) => d.match.test(name));
    if (def) return def.key;
    const key = `other:${name}`;
    if (!defsByKey[key])
      defsByKey[key] = { key, head: [name, ""], costAcct: null, accAcct: null };
    return key;
  };
  const deptOf = (v) => (v && String(v).trim()) || "UNASSIGNED";

  // ── Aggregate ─────────────────────────────────────────────────────────────
  const cat = {}; // key → { costBeg, add, accBeg, dep:[3], nbv }
  const dept = {}; // dept → key → [3]
  const ensureCat = (k) =>
    (cat[k] ??= { costBeg: 0, add: 0, accBeg: 0, dep: [0, 0, 0], nbv: 0 });

  let dashboardEndNBV = 0;
  rowData.forEach(({ asset, beginningNBV, endingNBV, deps }) => {
    // (NEW) skip the "ALL" placeholder as a category or department
    if (isAllPlaceholder(asset.category) || isAllPlaceholder(asset.issuedTo))
      return;

    const qty = asset.qty || 1;
    const cost = (Number(asset.assetCost) || 0) * qty;
    const p = new Date(asset.purchaseDate);
    const pFY = getFiscalYearLabel(p.getFullYear(), p.getMonth());
    const pPos = fiscalPos(p.getMonth());

    if (pFY > fy || (pFY === fy && pPos > qLast)) return; // not yet purchased

    const key = keyOf(asset.category);
    const c = ensureCat(key);
    if (pFY < fy || (pFY === fy && pPos < qFirst)) {
      c.costBeg += cost;
      // existed before the quarter → carries accumulated depreciation at the start
      c.accBeg += Math.max(cost - beginningNBV, 0);
    } else {
      // new addition this quarter → no beginning accumulated depreciation
      // (its Beg. NBV is 0 by design, so cost - beginningNBV would wrongly equal cost)
      c.add += cost;
    }
    c.nbv += endingNBV;
    dashboardEndNBV += endingNBV;

    const d = deptOf(asset.issuedTo);
    dept[d] ??= {};
    dept[d][key] ??= [0, 0, 0];
    deps.forEach((v, i) => {
      c.dep[i] += v || 0;
      dept[d][key][i] += v || 0;
    });
  });

  const extraKeys = Object.keys(defsByKey)
    .filter((k) => k.startsWith("other:"))
    .sort();
  const deptKeys = [...DEPT_ORDER, ...extraKeys];

  // (CHANGED) Only list departments that actually have depreciation within the
  // 3 months of the selected quarter. Departments whose assets exist but have
  // 0 depreciation for the period (fully depreciated, not yet started, etc.)
  // are left out.
  const hasDepreciation = (d) =>
    Object.values(dept[d]).some((monthly) =>
      monthly.some((v) => Math.abs(v) >= 0.005),
    );
  const deptNames = Object.keys(dept)
    .filter(hasDepreciation)
    .sort((a, b) => a.localeCompare(b));

  const wb = new ExcelJS.Workbook();
  const sheetBase = `${MONTH_ABBR[curEnd.getMonth()]} ${curEnd.getFullYear()}`;
  const quarterTitle = `${ORDINAL[qNum]} Quarter ${fy}-${fy + 1} Fiscal Year`;

  // ── small writers ─────────────────────────────────────────────────────────
  const put = (
    ws,
    r,
    c,
    value,
    { fmt, bold, fill, align, border, size } = {},
  ) => {
    const cell = ws.getCell(r, c);
    cell.value = value;
    if (fmt) cell.numFmt = fmt;
    cell.font = { name: "Calibri", size: size ?? 11, bold: !!bold };
    if (fill) cell.fill = fill;
    if (align) cell.alignment = align;
    if (border) cell.border = border;
    return cell;
  };
  const F = (formula, result) => ({ formula, result: r2(result) });
  const CENTER = { horizontal: "center", vertical: "middle", wrapText: true };
  const RIGHT = { horizontal: "right" };

  // ════════════════════════════════════════════════════════════════════════
  //  SHEET 1 — Departmentalized
  // ════════════════════════════════════════════════════════════════════════
  {
    const ws = wb.addWorksheet(sheetBase);
    const nC = deptKeys.length;
    const totalCol = nC + 2;
    ws.getColumn(1).width = 36;
    for (let c = 2; c <= totalCol; c++) ws.getColumn(c).width = 18;

    put(ws, 1, 1, "FIXED ASSETS (Departmentalized)", { bold: true, size: 13 });
    put(ws, 2, 1, `PSI_${quarterTitle} (Finalized)`, { bold: true });

    deptKeys.forEach((k, i) => {
      const d = defsByKey[k];
      put(ws, 3, i + 2, d.head[0], {
        bold: true,
        align: CENTER,
        fill: FILL_HEAD,
      });
      put(ws, 4, i + 2, d.head[1], {
        bold: true,
        align: CENTER,
        fill: FILL_HEAD,
      });
      put(ws, 5, i + 2, d.accAcct, {
        fmt: ACCT,
        bold: true,
        align: CENTER,
        fill: FILL_HEAD,
      });
    });
    put(ws, 3, totalCol, "TOTAL", {
      bold: true,
      align: CENTER,
      fill: FILL_HEAD,
    });
    ws.mergeCells(3, totalCol, 5, totalCol);
    put(ws, 5, 1, "Depreciation Expense", { bold: true });

    const val = (d, k, i) => r2(dept[d]?.[k]?.[i] || 0);
    const firstCol = colLetter(2);
    const lastCol = colLetter(nC + 1);

    let r = 7;
    const blockFirst = [];
    const blockTotals = []; // [colValues..., total] per month, for results
    qMonths.forEach(({ month, year }, i) => {
      const first = r;
      blockFirst.push(first);
      deptNames.forEach((d) => {
        put(ws, r, 1, d);
        let rowSum = 0;
        deptKeys.forEach((k, j) => {
          const v = val(d, k, i);
          rowSum += v;
          put(ws, r, j + 2, blankIfZero(v), { fmt: MONEY, align: RIGHT });
        });
        put(ws, r, totalCol, F(`SUM(${firstCol}${r}:${lastCol}${r})`, rowSum), {
          fmt: MONEY,
          align: RIGHT,
        });
        r++;
      });
      const last = r - 1;
      put(ws, r, 1, `DEPRECIATION (${MONTH_NAMES[month]} ${year})`, {
        bold: true,
      });
      let grand = 0;
      const colTotals = deptKeys.map((k, j) => {
        const t = deptNames.reduce((s, d) => s + val(d, k, i), 0);
        grand += t;
        const L = colLetter(j + 2);
        put(ws, r, j + 2, F(`SUM(${L}${first}:${L}${last})`, t), {
          fmt: MONEY,
          bold: true,
          align: RIGHT,
          fill: FILL_TOTAL,
          border: { top: THIN },
        });
        return t;
      });
      put(ws, r, totalCol, F(`SUM(${firstCol}${r}:${lastCol}${r})`, grand), {
        fmt: MONEY,
        bold: true,
        align: RIGHT,
        fill: FILL_TOTAL,
        border: { top: THIN },
      });
      blockTotals.push(colTotals);
      r += 2; // blank row after each block
    });

    // 3-month totals by department
    r += 0; // one extra blank (matches the source file)
    const tFirst = r;
    deptNames.forEach((d, di) => {
      put(ws, r, 1, d);
      let rowSum = 0;
      deptKeys.forEach((k, j) => {
        const v = [0, 1, 2].reduce((s, i) => s + val(d, k, i), 0);
        rowSum += v;
        const L = colLetter(j + 2);
        const refs = blockFirst.map((bf) => `${L}${bf + di}`).join("+");
        put(ws, r, j + 2, F(refs, v), { fmt: MONEY, align: RIGHT });
      });
      put(ws, r, totalCol, F(`SUM(${firstCol}${r}:${lastCol}${r})`, rowSum), {
        fmt: MONEY,
        align: RIGHT,
      });
      r++;
    });
    const tLast = r - 1;
    put(ws, r, 1, "TOTAL OF 3 MONTHS", { bold: true });
    let g3 = 0;
    const qTotals = deptKeys.map((k, j) => {
      const t = blockTotals.reduce((s, b) => s + b[j], 0);
      g3 += t;
      const L = colLetter(j + 2);
      put(ws, r, j + 2, F(`SUM(${L}${tFirst}:${L}${tLast})`, t), {
        fmt: MONEY,
        bold: true,
        align: RIGHT,
        fill: FILL_TOTAL,
        border: { top: THIN, bottom: DOUBLE },
      });
      return t;
    });
    put(ws, r, totalCol, F(`SUM(${firstCol}${r}:${lastCol}${r})`, g3), {
      fmt: MONEY,
      bold: true,
      align: RIGHT,
      fill: FILL_TOTAL,
      border: { top: THIN, bottom: DOUBLE },
    });
    const totalRow = r;
    r += 2;
    // plain re-statement of the quarter totals (as in the source file)
    deptKeys.forEach((_, j) => {
      const L = colLetter(j + 2);
      put(ws, r, j + 2, F(`${L}${totalRow}`, qTotals[j]), {
        fmt: MONEY,
        align: RIGHT,
      });
    });
    put(ws, r, totalCol, F(`${colLetter(totalCol)}${totalRow}`, g3), {
      fmt: MONEY,
      align: RIGHT,
    });
    r += 3;
    put(ws, r, 1, "PREPARED BY:", { bold: true });
    put(ws, r + 2, 1, preparedBy.name);
    put(ws, r + 3, 1, preparedBy.title);

    ws.views = [{ state: "frozen", xSplit: 1, ySplit: 5 }];
    ws.pageSetup = {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    };
  }

  // Sanity check against the dashboard's own End NBV
  const reportNBV = Object.values(cat).reduce(
    (s, c) =>
      s + c.costBeg + c.add - (c.accBeg + c.dep[0] + c.dep[1] + c.dep[2]),
    0,
  );
  if (Math.abs(reportNBV - dashboardEndNBV) > 1) {
    console.warn(
      `Report NBV (${r2(reportNBV)}) differs from dashboard End NBV (${r2(dashboardEndNBV)}).`,
    );
  }

  return {
    workbook: wb,
    fileName: `PSI_Departmental_Depreciation_Q${qNum}_FY${fy}-${fy + 1}.xlsx`,
    buttonLabel: `Departmental Report (${mdy(curEnd)})`,
  };
}

// ── Button ────────────────────────────────────────────────────────────────────
const DepartmentalReportButton = ({
  rowData = [],
  selectedFiscalYear,
  selectedQuarter,
}) => {
  const [loading, setLoading] = useState(false);
  const canGenerate =
    selectedQuarter && selectedQuarter !== "ALL" && selectedFiscalYear != null;

  const label = canGenerate
    ? buildDepartmentalWorkbook({
        rowData: [],
        fiscalYear: selectedFiscalYear,
        quarter: selectedQuarter,
      }).buttonLabel
    : "Departmental Report";

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const { workbook, fileName } = buildDepartmentalWorkbook({
        rowData,
        fiscalYear: selectedFiscalYear,
        quarter: selectedQuarter,
      });
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        fileName,
      );
    } catch (err) {
      console.error("Departmental report failed:", err);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generate}
      disabled={!canGenerate || loading}
      title={
        canGenerate
          ? label
          : "Select a specific quarter (not Fiscal Year) to generate the report"
      }
      className={[
        "flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-semibold transition",
        canGenerate && !loading
          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
          : "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400",
      ].join(" ")}
    >
      {loading ? "Generating…" : label}
    </button>
  );
};

export default DepartmentalReportButton;
